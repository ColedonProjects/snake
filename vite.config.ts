import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig( ( { mode } ) =>
{
  if ( mode === 'library' )
  {
    // Library build configuration
    return {
      build: {
        lib: {
          entry: resolve( __dirname, 'src/lib/index.ts' ),
          name: 'SnakeGame',
          fileName: 'index',
          formats: [ 'es' ]
        },
        rollupOptions: {
          external: [ 'pixi.js' ],
          output: {
            globals: {
              'pixi.js': 'PIXI'
            }
          }
        },
        outDir: 'dist',
        emptyOutDir: true
      }
    };
  }

  // Default standalone build configuration
  return {
    build: {
      outDir: 'dist',
      rollupOptions: {
        input: {
          main: resolve( __dirname, 'index.html' )
        }
      }
    }
  };
} ); 