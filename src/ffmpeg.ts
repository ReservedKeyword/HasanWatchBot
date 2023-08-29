import { spawn } from "fp-ts-simple-spawn"
import * as TE from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"
import path from "node:path"
import { deleteFile, readFile } from "./file"

export interface CropOptions {
  w: number
  h: number
  x: number
  y: number
}

export const takeScreenshotLastFrame = (m3u8Url: string, { w, h, x, y }: CropOptions) => {
  const tmpScreenshotPath = path.join(__dirname, `../images/screenshot_${Date.now()}_tmp.png`)

  return pipe(
    spawn("ffmpeg", [
      "-sseof",
      "-1",
      "-i",
      m3u8Url,
      "-update",
      "1",
      "-vframes",
      "1",
      "-q:v",
      "1",
      "-vf",
      `crop=${w}:${h}:${x}:${y}`,
      `${tmpScreenshotPath}`,
    ]),
    TE.chainW(() => readFile(tmpScreenshotPath)),
    TE.chainFirstW(() => deleteFile(tmpScreenshotPath))
  )
}
