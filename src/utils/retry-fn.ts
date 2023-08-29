import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/function"

const toMaximumRetriesError = (attempts: number, cause: unknown): Error =>
  new Error(`Retry failed after ${attempts} attempts`, { cause })

export const retryTimes = <A>(f: () => TaskEither<Error, A>, initialAttempts: number) => {
  const loop = (f: () => TaskEither<Error, A>, attemptsRemaining: number = initialAttempts): TaskEither<Error, A> =>
    pipe(
      f(),
      TE.fold(
        (error) =>
          attemptsRemaining <= 0
            ? TE.left(toMaximumRetriesError(initialAttempts, error))
            : loop(f, attemptsRemaining - 1),
        (result) => TE.right(result)
      )
    )
  return loop(f)
}
