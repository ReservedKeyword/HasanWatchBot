import * as I from "fp-ts/IO"
import { type IO } from "fp-ts/IO"
import { pipe } from "fp-ts/function"
// @ts-ignore
import { Parser } from "m3u8-parser"

export interface M3u8Manifest {
  playlists: Readonly<[{ uri: string }]>
}

export const parseM3u8 = (manifest: string): M3u8Manifest => {
  const parser = new Parser()
  parser.push(manifest)
  parser.end()
  return parser.manifest as M3u8Manifest
}

export const getPlaylistFromManifest = (manifest: string): IO<string> =>
  pipe(
    I.of(manifest),
    I.map(parseM3u8),
    I.map((manifest) => manifest.playlists[0].uri)
  )
