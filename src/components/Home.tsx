import { useEffect, useContext, useState } from 'react'
import { NDKEvent } from '@nostr-dev-kit/ndk'
import { NDKContext } from '../providers/NDKProvider'
import { Publish } from './Publish'

const isTest = (game: NDKEvent) => {
  const findTest = game.tags.find((tag: string[]) => tag[0] === 'subject')![1].toLowerCase().includes('test') || game.content.includes('test')
  return !!findTest
}

export const Home = () => {
  const [showGames, setShowGames] = useState<boolean>(true)
  const ndk = useContext(NDKContext)
  const [games, setGames] = useState<NDKEvent[]>([])

  useEffect(() => {
    if (!ndk) return
    const fetchLatestGames = async () => {
      const loaded = await ndk.fetchEvents({ kinds: [1], limit: 10, "#t": ["crashglow"] })
      setGames(Array.from(loaded))
    }
    fetchLatestGames()
  }, [ndk])

  const latestGames = () => {
    const latest = games.map((game) => {
      if (isTest(game)) return null
      const version = game.tags.find((tag) => tag[0] === 'u')![1].split('_')[1]
      if (!game.content) return null
      if (game.content === 'test') return null
      return (
        <div key={game.id} className="game-card">
          <h3 className="game-card-title">{game.tags.find((tag) => tag[0] === 'subject')![1]}<small style={{float:'right'}}>{version}</small></h3>
          <img className="game-card-preview" src={game.content.split('\n')[0]}/>
          <br/>
          <br/>
          <button className="button" onClick={() => {window.location.href=`/play/${game.id}`}}>Play 👾</button>
        </div>
      )
    })
    if (latest.length === 0) return <p>No games found! 😿</p>
    return latest
  }

  return (
    <div id="component-home" className="primary">
      <div className="layout">
        <Publish setShowGames={setShowGames}/>
        { showGames ?  <><h2>Games</h2>{latestGames()}</> : null }
      </div>
    </div>
  )
}