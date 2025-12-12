import SongChart from "./SongChart";

type SongDetails = {
  songId: number;
  titel: string;
  artistName: string;
  releaseYear: number;
  imageUrl?: string;
  lyrics?: string;

  chartHistory: Array<{
    year: number;
    position: number;
  }>;
};

export default function SongDetail({ song }: { song: SongDetails }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-blue-600 text-white pb-20">

      {/* HERO */}
      <div className="max-w-6xl mx-auto px-6 py-12 flex space-x-10 items-center">
        <img
          src={song.imageUrl || "/images/placeholder.png"}
          alt={song.titel}
          className="h-48 w-48 rounded-xl shadow-xl object-cover"
        />

        <div>
          <h1 className="text-3xl font-bold mb-1">{song.titel}</h1>
          <h2 className="text-xl opacity-90">{song.artistName}</h2>
          <p className="mt-2 opacity-80">Released: {song.releaseYear}</p>

          {/* BUTTONS */}
          <div className="flex space-x-4 mt-5">
            <button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow">
              Connect to Play
            </button>

            <button className="px-4 py-2 bg-red-700 hover:bg-red-800 text-white rounded-lg shadow flex items-center space-x-1">
              <span>+</span>
              <span>Add to Playlist</span>
            </button>

            <a
              href={`https://www.youtube.com/results?search_query=${song.titel}+${song.artistName}`}
              target="_blank"
              className="px-4 py-2 bg-red-900 hover:bg-red-950 text-white rounded-lg shadow flex items-center space-x-2"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 15l6-5-6-5v10z" />
              </svg>
              <span>YouTube</span>
            </a>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="bg-white text-black rounded-t-3xl p-8 max-w-6xl mx-auto">

        {/* CHART HISTORY */}
        <h3 className="text-xl font-bold mb-4">Chart History</h3>

        <div className="bg-white border rounded-xl shadow p-6">
          <SongChart data={song.chartHistory} />

          {/* TWO YEAR CARDS BELOW */}
          <div className="grid grid-cols-2 gap-4 mt-6">
            {song.chartHistory.slice().reverse().map((e) => (
              <div
                key={e.year}
                className="bg-gray-50 p-4 text-center rounded-lg shadow-sm"
              >
                <div className="text-lg font-semibold">{e.year}</div>
                <div className="text-red-600 font-bold">#{e.position}</div>
              </div>
            ))}
          </div>
        </div>

        {/* GRID: Lyrics left, sidebar right */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* LYRICS CARD */}
          <div className="bg-white border rounded-xl shadow p-6 min-h-[350px] lg:col-span-2">
            <h3 className="text-lg font-semibold mb-3">Lyrics</h3>
            <p className="whitespace-pre-line text-gray-700">
              {song.lyrics || "No lyrics available."}
            </p>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-8">

            {/* ABOUT THE ARTIST */}
            <div className="bg-white border rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">About the Artist</h3>

              <div className="flex items-center space-x-3">
                <div className="h-14 w-14 bg-gray-200 rounded-full"></div>
                <div>
                  <p className="font-semibold">{song.artistName}</p>
                  <p className="text-sm text-gray-500">{song.chartHistory.length} songs in TOP2000</p>
                </div>
              </div>

              <p className="text-sm text-gray-500 mt-4">
                {song.artistBiography || "No artist biography available."}
              </p>

              <button className="mt-4 w-full py-2 border rounded-lg hover:bg-gray-100">
                View Artist Profile
              </button>
            </div>

            {/* SONG DETAILS */}
            <div className="bg-white border rounded-xl shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Song Details</h3>

              <div className="space-y-2 text-gray-700">

                <p>
                  <strong>Title</strong><br />
                  {song.titel}
                </p>

                <p>
                  <strong>Artist</strong><br />
                  {song.artistName}
                </p>

                <p>
                  <strong>Year Released</strong><br />
                  {song.releaseYear}
                </p>

                <p>
                  <strong>Times in TOP2000</strong><br />
                  {song.chartHistory.length} times
                </p>

                <p>
                  <strong>Best Rank</strong><br />
                  #{Math.min(...song.chartHistory.map((e) => e.position))}
                </p>

              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
