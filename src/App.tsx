import { useEffect, useRef, useState } from 'react';
import { IRefPhaserGame, PhaserGame } from './game/PhaserGame';
import { MainMenu } from './game/scenes/MainMenu';

function getWindowDimensions() {
    const { innerWidth: width, innerHeight: height } = window;
    return {
        width,
        height
    };
}

function useWindowDimensions() {
    const [windowDimensions, setWindowDimensions] = useState(getWindowDimensions());

    useEffect(() => {
        function handleResize() {
            setWindowDimensions(getWindowDimensions());
        }

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return windowDimensions;
}
function App() {
    //  References to the PhaserGame component (game and scene are exposed)
    const phaserRef = useRef<IRefPhaserGame | null>(null);
    const { width } = useWindowDimensions();

    const changeScene = () => {

        if (phaserRef.current) {
            const scene = phaserRef.current.scene as MainMenu;

            if (scene) {
                scene.changeScene();
            }
        }
    }

    // Event emitted from the PhaserGame component
    const currentScene = (_: Phaser.Scene) => {

    }

    return (
        <main className='flex flex-col h-screen w-full justify-center items-center bg-stone-100 text-stone-700 dark:bg-stone-700 dark:text-stone-100'>

            {
                width < Number(phaserRef.current?.game?.config.width ?? 0) ?
                    <p className='bg-stone-500 p-4 rounded-lg text-center'>This game requires a minimum width of <b>{phaserRef.current?.game?.config.width ?? 0}px</b>.</p> :
                    <div className="flex flex-col font-[Silkscreen] gap-10 p-28">
                        <h1 className='text-6xl text-center'>Counting Sheep</h1>
                        <PhaserGame ref={phaserRef} currentActiveScene={currentScene} />
                        <div className='flex flex-row w-full justify-center'>
                            <button className="px-6 py-4 text-2xl rounded-xl bg-stone-600 text-stone-200 dark:bg-stone-800 hover:bg-stone-500 hover:dark:bg-stone-900 active:underline" onClick={changeScene}>Restart</button>
                        </div>
                    </div>
            }

        </main >
    )
}

export default App
