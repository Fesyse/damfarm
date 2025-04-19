import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GameButtons } from "@/components/farm-game/game-buttons"

export default function WelcomePage() {
  return (
    <div
      className='min-h-screen flex flex-col items-center justify-center'
      style={{
        backgroundImage: "url('/minecraft-farm.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Card
        className='w-[350px] shadow-lg border-4 border-[#5D4037] bg-[#E0E0E0]/90'
        style={{ boxShadow: "0 0 0 4px #8B4513" }}
      >
        <CardHeader className='pb-2'>
          <CardTitle
            className='text-5xl font-bold text-center'
            style={{
              color: "#2E7D32",
              textShadow: "2px 2px 0 #000",
              fontFamily: "'Minecraft', system-ui, sans-serif",
            }}
          >
            Damfarm
          </CardTitle>
        </CardHeader>
        <CardContent>
          <GameButtons />
        </CardContent>
      </Card>
    </div>
  )
}
