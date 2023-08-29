export const CHANNEL_QUERY = (name: string): string => `
    {
        channel(name: "${name}") {
            id
            name
            stream {
                archiveVideo {
                    id
                    status
                    title
                }
                game {
                    id
                    name
                }
                id
                type
                viewersCount
            }
        }
    }
`

export const PLAYBACK_ACCESS_TOKEN = (videoId: string): string => `
    {
        videoPlaybackAccessToken(
            id: "${videoId}",
            params: {
                platform: "web",
                playerBackend: "mediaplayer",
                playerType: "site"
            }
        ) {
            signature
            value
        }
    }
`
