import * as TE from "fp-ts/TaskEither"
import { type TaskEither } from "fp-ts/TaskEither"
import { pipe } from "fp-ts/lib/function"
import path from "path"
import { Database, ISqlite, open as sqlOpen } from "sqlite"
import sqlite3 from "sqlite3"
import { type VideoDetails } from "./types/youtube"

const toSqlError = (cause: unknown): Error => new Error(`${cause}`, { cause })

const openDatabase: TaskEither<Error, Database> = TE.tryCatch(
  () => sqlOpen({ filename: path.join(__dirname, "../database.db"), driver: sqlite3.Database }),
  toSqlError
)

const executeStatement =
  (stmt: ISqlite.SqlType, ...params: any[]) =>
  (db: Database): TaskEither<Error, ISqlite.RunResult<sqlite3.Statement>> =>
    TE.tryCatch(() => db.run(stmt, params), toSqlError)

const closeDatabase = (db: Database): TaskEither<Error, void> => TE.tryCatch(() => db.close(), toSqlError)

export const insertVideo = ({ title, url, channelName }: VideoDetails) =>
  pipe(
    openDatabase,
    TE.chain((database) =>
      pipe(
        database,
        executeStatement(`INSERT INTO videos (title, url, channel_name) VALUES (?, ?, ?);`, title, url, channelName),
        TE.chainFirst((_) => closeDatabase(database))
      )
    )
  )
