const StatsCard = ({ title, value, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-md hover:shadow-xl dark:border-slate-700 transition">

      <h2 className="text-gray-500 dark:text-slate-400 text-sm">
        {title}
      </h2>

      <p className={`text-3xl font-bold mt-3 ${color}`}>
        {value}
      </p>

    </div>
  )
}

export default StatsCard