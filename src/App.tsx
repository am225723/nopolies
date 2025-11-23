import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import "@fontsource/inter";
import { useMonopoly } from "./lib/stores/useMonopoly";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { SEO } from "./components/SEO";
import { analytics } from "./lib/analytics";
import { Menu } from "./components/Menu";
import { ThemeSelection } from "./components/ThemeSelection";
import { BoardCreator } from "./components/BoardCreator";
import { TokenCreator } from "./components/TokenCreator";
import { Board3D } from "./components/Board3D";
import { GamePiece } from "./components/GamePiece";
import { GameUI } from "./components/GameUI";
import { CameraControls } from "./components/CameraControls";

function App() {
  const { phase, players } = useMonopoly();

  React.useEffect(() => {
    // Track app initialization
    analytics.track('app_loaded');
  }, []);

  return (
    <ErrorBoundary>
      <SEO />
      <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        {phase === "menu" && <Menu />}
        {phase === "theme_selection" && <ThemeSelection />}
        {phase === "board_creator" && <BoardCreator />}
        {phase === "token_creator" && <TokenCreator />}

        {(phase === "playing" || phase === "property_action") && (
          <>
            <Canvas
              shadows
              camera={{
                position: [20, 15, 20],
                fov: 50,
                near: 0.1,
                far: 1000
              }}
              gl={{
                antialias: true,
                powerPreference: "high-performance"
              }}
              onError={(error) => {
                analytics.trackError('canvas_error', error.message);
              }}
            >
              <color attach="background" args={["#87CEEB"]} />

              {/* Lighting */}
              <ambientLight intensity={0.6} />
              <directionalLight
                position={[10, 20, 10]}
                intensity={1}
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-far={50}
                shadow-camera-left={-30}
                shadow-camera-right={30}
                shadow-camera-top={30}
                shadow-camera-bottom={-30}
              />
              <pointLight position={[-10, 10, -10]} intensity={0.5} />

              <Suspense fallback={null}>
                <Board3D />
                {players.map(player => (
                  <GamePiece
                    key={player.id}
                    player={player}
                    targetPosition={player.position}
                  />
                ))}
              </Suspense>

              <CameraControls />
            </Canvas>
            <GameUI />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
