import { dragDrop, dragEnd, dragStart } from '../store';
import { useAppDispatch } from '../store/hooks';

interface TileProps {
  candy: string;
  candyId: number;
}

function Tile({ candy, candyId }: TileProps) {
  const dispatch = useAppDispatch();

  return (
    <div
      className="
        relative
        aspect-square

        /* mobile */
        w-[10vw] min-w-[38px] max-w-[52px]

        /* tablet */
        sm:w-[8vw] sm:max-w-[60px]

        /* desktop */
        md:w-[62px]
        lg:w-[68px]
        xl:w-[72px]

        rounded-xl sm:rounded-2xl
        flex items-center justify-center
        overflow-hidden
        transition-all duration-200
        hover:scale-105
        active:scale-95
      "
      style={{
        background:
          'linear-gradient(145deg, #3a3a45 0%, #1f1f27 55%, #121218 100%)',
        boxShadow: `
          inset 2px 2px 4px rgba(255,255,255,0.12),
          inset -2px -2px 4px rgba(0,0,0,0.55),
          0 4px 10px rgba(0,0,0,0.35)
        `,
      }}
    >
      {/* glossy highlight */}
      <div className="
        absolute inset-0
        bg-gradient-to-br from-white/20 via-transparent to-transparent
        pointer-events-none
      "/>

      {candy && (
<img
  src={candy}
  alt="candy"
  draggable
  className="
    relative z-10
    w-[68%] h-[68%]
    sm:w-[72%] sm:h-[72%]
    md:w-[78%] md:h-[78%]
    object-contain
    rounded-2xl
    shadow-lg
    cursor-grab active:cursor-grabbing
    transition-all duration-200 ease-out
    hover:scale-110 hover:rotate-2
  "
  onDragStart={(e) =>
    dispatch(dragStart(e.target as HTMLImageElement))
  }
  onDragOver={(e) => e.preventDefault()}
  onDragEnter={(e) => e.preventDefault()}
  onDragLeave={(e) => e.preventDefault()}
  onDrop={(e) =>
    dispatch(dragDrop(e.target as HTMLImageElement))
  }
  onDragEnd={() => dispatch(dragEnd())}
  candy-id={candyId}
/>
      )}

      {/* bottom glow */}
      <div className="
        absolute bottom-1 left-2 right-2
        h-2 rounded-full bg-white/10 blur-sm
      "/>
    </div>
  );
}

export default Tile;