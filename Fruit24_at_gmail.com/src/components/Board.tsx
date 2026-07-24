import { useAppSelector } from '../store/hooks';
import Tile from './Tile';

function Board() {
  const board: string[] = useAppSelector(
    ({ candyCrush: { board } }) => board
  );

  const boardSize: number = useAppSelector(
    ({ candyCrush: { boardSize } }) => boardSize
  );

  return (
    <div
      className="min-h-screen flex items-center justify-center  relative"
      
    >
      {/* overlay */}
      <div className="" />

      <div className="relative z-10 w-full flex justify-center">
        {/* Board Container */}
        <div
          className="
            rounded-[24px] sm:rounded-[28px]
            p-3 sm:p-4 
            bg-[#120022]/95
            border border-white/10
            shadow-[0_20px_60px_rgba(0,0,0,0.6)]
            w-fit
            max-w-[98vw]
          "
        >
          {/* Header */}
          <div className="text-center mb-3 sm:mb-4">
            <h1 className="
              text-white font-black tracking-wide
              text-xl sm:text-2xl md:text-3xl
              flex items-center justify-center gap-2
            ">
              🍓 Fruit Crush
            </h1>

            <p className="
              text-purple-200
              text-[10px] sm:text-xs md:text-sm
              mt-1
            ">
              Match 3 fruits and score big!
            </p>
          </div>

          {/* Responsive Grid */}
          <div
            className="
              grid
              gap-1 sm:gap-2
              rounded-2xl
              bg-[#070010]
              border border-white/5
              p-2 sm:p-3
              shadow-inner
            "
            style={{
              gridTemplateColumns: `repeat(${boardSize}, minmax(0, 1fr))`,
            }}
          >
            {board.map((candy: string, index: number) => (
              <Tile candy={candy} key={index} candyId={index} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Board;