import type { NodeTypes } from 'reactflow'
import RawReaderNode from '../components/RawReaderNode'
import ConvolutionNode from '../components/ConvolutionNode'
import PointOpNode from '../components/PointOpNode'
import DisplayNode from '../components/DisplayNode'
import HistogramNode from '../components/HistogramNode'
import DifferenceNode from '../components/DifferenceNode'
import SaveNode from '../components/SaveNode'

export const nodeTypes: NodeTypes = {
  RAW_READER: RawReaderNode,
  CONVOLUTION: ConvolutionNode,
  POINT_OP: PointOpNode,
  DISPLAY: DisplayNode,
  HISTOGRAM: HistogramNode,
  DIFFERENCE: DifferenceNode,
  SAVE: SaveNode,
}
