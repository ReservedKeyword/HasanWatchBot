import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"
import fs from "node:fs/promises"
import { type FilePath } from "./types/file"

const toFileError = (cause: unknown): Error => new Error(`${cause}`, { cause })

export const deleteFile = (path: FilePath): TaskEither<Error, void> =>
  TE.tryCatch(() => fs.rm(path, { force: true }), toFileError)

export const readFile = (path: FilePath): TaskEither<Error, Buffer> => TE.tryCatch(() => fs.readFile(path), toFileError)

export const writeFile = (path: FilePath, contents: Buffer): TaskEither<Error, FilePath> =>
  pipe(
    TE.tryCatch(() => fs.writeFile(path, contents), toFileError),
    TE.map(() => path)
  )
