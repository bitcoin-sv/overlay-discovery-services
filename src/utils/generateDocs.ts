import { exec } from 'child_process'
import { promisify } from 'util'
import * as path from 'path'

const execPromise = promisify(exec)

interface DocConfig {
  input: string
  output: string
}

const docs: DocConfig[] = [
  {
    input: './src/SHIP/SHIPTopicManager.ts',
    output: './docs/SHIP/ship-topic-manager.md'
  },
  {
    input: './src/SHIP/SHIPLookupService.ts',
    output: './docs/SHIP/ship-lookup-service.md'
  },
  {
    input: './src/SHIP/SHIPStorage.ts',
    output: './docs/SHIP/ship-storage.md'
  },
  {
    input: './src/SLAP/SLAPTopicManager.ts',
    output: './docs/SLAP/slap-topic-manager.md'
  },
  {
    input: './src/SLAP/SLAPLookupService.ts',
    output: './docs/SLAP/slap-lookup-service.md'
  },
  {
    input: './src/SLAP/SLAPStorage.ts',
    output: './docs/SLAP/slap-storage.md'
  }
]

// Helper function for generating updated documentation
const generateDocs = async () => {
  for (const doc of docs) {
    const command = `npx ts2md --inputFilename ${path.resolve(doc.input)} --outputFilename ${path.resolve(doc.output)} --firstHeadingLevel 2 --noTitle true --readmeMerge true`
    try {
      const { stdout, stderr } = await execPromise(command)
      console.log(`stdout: ${stdout}`)
      console.error(`stderr: ${stderr}`)
    } catch (error) {
      console.error(`Error generating documentation for ${doc.input}:`, error)
    }
  }
}

generateDocs().then(() => console.log('Documentation generation complete')).catch(error => console.error('Error:', error))
