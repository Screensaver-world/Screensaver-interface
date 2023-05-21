// commit
import { Interface } from '@ethersproject/abi'

import GALLERY_ABI from './gallery.json'
// import GALLERY_BYTES32_ABI from './gallery_bytes32.json'

const GALLERY_INTERFACE = new Interface(GALLERY_ABI)

// const GALLERY_BYTES32_INTERFACE = new Interface(GALLERY_BYTES32_ABI)

export default GALLERY_INTERFACE
export { GALLERY_ABI }
