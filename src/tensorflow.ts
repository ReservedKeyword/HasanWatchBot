import { type Tensor3D } from "@tensorflow/tfjs-node"
import * as IOE from "fp-ts/IOEither"
import { type IOEither } from "fp-ts/IOEither"
import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"
import Upscaler from "upscaler/node"

// Tensorflow doesn't work with ES6 imports :(
const tf = require("@tensorflow/tfjs-node")

const toTensorFlowError = (cause: unknown): Error => new Error(`${cause}`, { cause })

const toUpscalerError = (cause: unknown): Error => new Error(`${cause}`, { cause })

const decodePng = (content: Uint8Array, channels?: number): IOEither<Error, Tensor3D> =>
  IOE.tryCatch(() => tf.node.decodePng(content, channels), toTensorFlowError)

const upscaleImage = (image: Tensor3D): TaskEither<Error, Tensor3D> =>
  TE.tryCatch(() => new Upscaler().upscale(image, { output: "tensor" }), toUpscalerError)

const encodeImage = (image: Tensor3D): TaskEither<Error, Uint8Array> =>
  TE.tryCatch(() => tf.node.encodePng(image), toTensorFlowError)

export const upscaleAndEncodeImage = (buffer: Buffer, channels?: number): TaskEither<Error, Buffer> =>
  pipe(
    decodePng(buffer, channels),
    TE.fromIOEither,
    TE.chain(upscaleImage),
    TE.chain(encodeImage),
    TE.map((int8Array) => Buffer.from(int8Array))
  )
