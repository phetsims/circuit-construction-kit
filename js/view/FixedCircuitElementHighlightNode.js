// Copyright 2017-2020, University of Colorado Boulder

/**
 * Node used by FixedCircuitElementNode to show its yellow highlight rectangle.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

// constants
const PADDING = 10; // in view coordinates
const CORNER_RADIUS = 8; // in view coordinates

class FixedCircuitElementHighlightNode extends Rectangle {

  /**
   * @param {FixedCircuitElementNode} fixedCircuitElementNode
   */
  constructor( fixedCircuitElementNode ) {

    super( 0, 0, 0, 0,
      CORNER_RADIUS,
      CORNER_RADIUS, {
        stroke: CCKCConstants.HIGHLIGHT_COLOR,
        lineWidth: CCKCConstants.HIGHLIGHT_LINE_WIDTH,
        pickable: false
      } );

    this.recomputeBounds( fixedCircuitElementNode );
  }

  /**
   * Update the dimensions of the highlight, called on startup and when components change from lifelike/schematic.
   * @param {FixedCircuitElementNode} fixedCircuitElementNode
   * @public
   */
  recomputeBounds( fixedCircuitElementNode ) {

    // This is called rarely and hence the extra allocation is OK
    this.setRectBounds( fixedCircuitElementNode.contentNode.localBounds.dilated( PADDING ) );
  }
}

circuitConstructionKitCommon.register( 'FixedCircuitElementHighlightNode', FixedCircuitElementHighlightNode );
export default FixedCircuitElementHighlightNode;