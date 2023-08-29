import * as RE from "fp-ts-contrib/RegExp"
import * as IOE from "fp-ts/IOEither"
import { type IOEither } from "fp-ts/IOEither"
import * as O from "fp-ts/Option"
import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"
import type { LiveVideo, Video } from "youtubei"
import { Client } from "youtubei"
import { type VideoDetails } from "./types/youtube"

const client = new Client()

const toIdNotExtractedError = (text: string): Error => new Error(`Failed to extract ID from text: ${text}`)

const toVideoNotFoundError = (id: string): Error => new Error(`Video with ID ${id} could not be found`)

export const extractDetailsFromVideo = (video: LiveVideo | Video): VideoDetails => ({
  channelName: video.channel.name,
  title: video.title,
  url: `https://youtu.be/watch?v=${video.id}`,
})

export const getIdFromUrl = (text: string): IOEither<Error, string> =>
  pipe(
    text.trim(),
    RE.match(/(?:youtube\.?com|youtu.?be)(?:\/(?:[\w\-]+\?v=|embed\/|live\/|v\/)?)([\w\-]+)/),
    O.map((matches: string[]) => Array.from(matches)),
    O.chain((items) => O.fromNullable(items[1])),
    IOE.fromOption(() => toIdNotExtractedError(text))
  )

export const getVideoById = (id: string): TaskEither<Error, LiveVideo | Video> =>
  pipe(
    TE.tryCatch(
      () => client.getVideo(id),
      () => toVideoNotFoundError(id)
    ),
    TE.chain((maybeVideo) => pipe(maybeVideo, TE.fromNullable(toVideoNotFoundError(id))))
  )
