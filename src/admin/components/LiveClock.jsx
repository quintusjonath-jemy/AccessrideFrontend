import { useEffect, useState } from "react"

const LiveClock = () => {

  const [time, setTime] = useState(new Date())

  useEffect(() => {

    const interval = setInterval(() => {
      setTime(new Date())
    }, 1000)

    return () => clearInterval(interval)

  }, [])

  return (
    <div className="bg-white px-4 py-2 rounded-xl shadow-md">

      <p className="text-gray-500 text-sm">
        Current Time
      </p>

      <h2 className="text-xl font-bold">
        {time.toLocaleTimeString()}
      </h2>

    </div>
  )
}

export default LiveClock