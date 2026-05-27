function StatsCard({ title, value, color }) {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md hover:shadow-xl transition">

      <h2 className="text-gray-500 text-sm">
        {title}
      </h2>

      <p className={`text-3xl font-bold mt-3 ${color}`}>
        {value}
      </p>

    </div>
  )
}

export default StatsCard