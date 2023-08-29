import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { PSM, createWorker } from "tesseract.js"
import { type TesseractCallback } from "./types/tesseract"

const toTesseractError = (cause: unknown): Error => new Error(`${cause}`, { cause })

const runTesseract = async (path: string, callback: TesseractCallback) => {
  try {
    const worker = await createWorker()
    await worker.loadLanguage("eng")
    await worker.initialize("eng")
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_LINE })

    const {
      data: { text },
    } = await worker.recognize(path)

    await worker.terminate()
    return callback(null, text)
  } catch (err) {
    return callback(toTesseractError(err))
  }
}

export const getTextByOcr = (path: string): TaskEither<Error, string> => TE.taskify(runTesseract)(path)
