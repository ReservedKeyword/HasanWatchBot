import * as IOE from "fp-ts/IOEither"
import { type IOEither } from "fp-ts/IOEither"
import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import Jimp from "jimp"

const toJimpError = (cause: unknown): Error => new Error(`${cause}`, { cause })

export const bufferToJimp = (buffer: Buffer): TaskEither<Error, Jimp> =>
  TE.tryCatch(() => Jimp.read(buffer), toJimpError)

export const contrastImage = (image: Jimp): IOEither<Error, Jimp> => IOE.tryCatch(() => image.contrast(1), toJimpError)

export const grayscaleImage = (image: Jimp): IOEither<Error, Jimp> => IOE.tryCatch(() => image.grayscale(), toJimpError)

export const invertColors = (image: Jimp): IOEither<Error, Jimp> => IOE.tryCatch(() => image.invert(), toJimpError)

export const scaleImage = (image: Jimp): IOEither<Error, Jimp> => IOE.tryCatch(() => image.scale(2), toJimpError)

export const jimpToPngBuffer = (jimp: Jimp): TaskEither<Error, Buffer> =>
  TE.tryCatch(() => jimp.getBufferAsync(Jimp.MIME_PNG), toJimpError)
