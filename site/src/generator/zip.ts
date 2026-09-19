import JSZip from 'jszip'
import type { ProjectConfig } from './config'
import { slug } from './config'
import { generateProject, type GeneratedFile } from './files'

export async function buildZipBlob(c: ProjectConfig): Promise<{ blob: Blob; files: GeneratedFile[] }> {
  const files = generateProject(c)
  const zip = new JSZip()
  const root = zip.folder(`${slug(c.productName)}-agentic`)!
  for (const file of files) root.file(file.path, file.content)
  const blob = await zip.generateAsync({ type: 'blob' })
  return { blob, files }
}
