// Copyright 2015-2021, University of Colorado Boulder

/**
 * Shows the socket (base) of the light bulb only, so that it will appear that the charges go "inside" the base.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Matrix3 from '../../../dot/js/Matrix3.js';
import merge from '../../../phet-core/js/merge.js';
import Rectangle from '../../../scenery/js/nodes/Rectangle.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CustomLightBulbNode from './CustomLightBulbNode.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
const SCRATCH_MATRIX = new Matrix3();

class LightBulbSocketNode extends FixedCircuitElementNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for icon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {LightBulb} lightBulb - the light bulb model
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView, circuitLayerNode, lightBulb, viewTypeProperty, tandem, options ) {

    // Render the bulb socket only
    const lightBulbNode = new CustomLightBulbNode( new NumberProperty( 0 ), {
      baseOnly: true,
      highResistance: lightBulb.highResistance,
      real: lightBulb.real
    } );

    // Interferes with Cut Button selection when the foreground is in front, see
    // https://github.com/phetsims/circuit-construction-kit-black-box-study/issues/18
    options = merge( {
      pickable: false,

      // Suppress the highlight for the socket, the highlight is shown by the CCKCLightBulbNode
      showHighlight: false
    }, options );
    super( screenView, circuitLayerNode, lightBulb, viewTypeProperty, lightBulbNode, new Rectangle( 0, 0, 10, 10 ),
      tandem, options );
  }

  /**
   * Multiple updates may happen per frame, they are batched and updated once in the view step to improve performance.
   * @override
   * @protected - CCKCLightBulbNode calls updateRender for its child socket node
   */
  updateRender() {
    const startPosition = this.circuitElement.startPositionProperty.get();
    const endPosition = this.circuitElement.endPositionProperty.get();
    const angle = endPosition.minus( startPosition ).angle + Math.PI / 4;

    // Update the node transform in a single step, see #66
    this.contentNode.setMatrix( SCRATCH_MATRIX.setToTranslationRotationPoint( startPosition, angle ) );
  }

  /**
   * Maintain the opacity of the brightness lines while changing the opacity of the light bulb itself.
   * @override
   * @public
   */
  updateOpacityOnInteractiveChange() {

    // TODO (black-box-study): Make the light bulb images look faded out.
  }
}

circuitConstructionKitCommon.register( 'LightBulbSocketNode', LightBulbSocketNode );
export default LightBulbSocketNode;