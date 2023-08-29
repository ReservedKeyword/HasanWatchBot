import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"
import path from "node:path"
import { takeScreenshotLastFrame, type CropOptions } from "./ffmpeg"
import { writeFile } from "./file"
import { bufferToJimp, contrastImage, grayscaleImage, invertColors, jimpToPngBuffer, scaleImage } from "./jimp"
import { getPlaylistFromManifest } from "./m3u8"
import { insertVideo } from "./sqlite"
import { upscaleAndEncodeImage } from "./tensorflow"
import { getTextByOcr } from "./tesseract"
import { getChannel, getPlaybackAccessToken, getPlaylistsFromManifest, getStreamVideoId } from "./twitch"
import { type VideoDetails } from "./types/youtube"
import { retryTimes } from "./utils/retry-fn"
import { extractDetailsFromVideo, getIdFromUrl, getVideoById } from "./youtube"

const FFMPEG_CROP_OPTIONS: CropOptions = {
  w: 860,
  h: 42,
  x: 124,
  y: 42,
}

const getCurrentPlaylistManifest = (username: string) =>
  pipe(
    getChannel(username),
    TE.chain(getStreamVideoId),
    TE.chain(getPlaybackAccessToken),
    TE.chain(getPlaylistsFromManifest),
    TE.chainW((playlistManifest) => pipe(getPlaylistFromManifest(playlistManifest), TE.fromIO))
  )

const captureScreenshot = (playlistUri: string) => {
  const screenshotPath = path.join(__dirname, `../images/${Date.now()}.png`)

  return pipe(
    takeScreenshotLastFrame(playlistUri, FFMPEG_CROP_OPTIONS),
    TE.chainW((screenshotBuffer) => upscaleAndEncodeImage(screenshotBuffer, 3)),
    TE.chainW(enhanceImageWithJimp),
    TE.chainW((enhancedBuffer) => writeFile(screenshotPath, enhancedBuffer))
  )
}

const enhanceImageWithJimp = (buffer: Buffer) =>
  pipe(
    bufferToJimp(buffer),
    TE.chain((image) => pipe(contrastImage(image), TE.fromIOEither)),
    TE.chain((image) => pipe(grayscaleImage(image), TE.fromIOEither)),
    TE.chain((image) => pipe(invertColors(image), TE.fromIOEither)),
    TE.chain((image) => pipe(scaleImage(image), TE.fromIOEither)),
    TE.chain(jimpToPngBuffer)
  )

const getVideoDetails = (url: string): TaskEither<Error, VideoDetails> =>
  pipe(
    TE.of(url),
    TE.chain((url) => pipe(url, getIdFromUrl, TE.fromIOEither)),
    TE.chain(getVideoById),
    TE.map(extractDetailsFromVideo)
  )

;(() => {
  console.log("Booting up...")
  pipe(
    getCurrentPlaylistManifest("hasanabi"),
    TE.chain(captureScreenshot),
    TE.chainW((screenshotPath) => retryTimes(() => pipe(screenshotPath, getTextByOcr, TE.chainW(getVideoDetails)), 3)),
    TE.chainW(insertVideo),
    TE.match(
      (error) => console.error(error),
      () => console.log("Successfully parsed video & added to database")
    )
  )().then()
})()
