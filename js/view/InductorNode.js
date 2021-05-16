// Copyright 2015-2020, University of Colorado Boulder

/**
 * Renders the lifelike/schematic view for an Inductor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Matrix3 from '../../../dot/js/Matrix3.js';
import Utils from '../../../dot/js/Utils.js';
import Shape from '../../../kite/js/Shape.js';
import LineStyles from '../../../kite/js/util/LineStyles.js';
import merge from '../../../phet-core/js/merge.js';
import Node from '../../../scenery/js/nodes/Node.js';
import Path from '../../../scenery/js/nodes/Path.js';
import Color from '../../../scenery/js/util/Color.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import FixedCircuitElementNode from './FixedCircuitElementNode.js';

// constants
// dimensions for schematic
const NUMBER_OF_BUMPS = 4;
const SCHEMATIC_WIDTH = CCKCConstants.INDUCTOR_LENGTH;
const SCHEMATIC_MARGIN = 20;
const SCHEMATIC_ARC_RADIUS = ( SCHEMATIC_WIDTH - SCHEMATIC_MARGIN * 2 ) / NUMBER_OF_BUMPS / 2;

const schematicShape = new Shape()
  .moveTo( 0, 0 ) // left wire
  .lineTo( SCHEMATIC_MARGIN, 0 )
  .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 1, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false )
  .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 3, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false )
  .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 5, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false )
  .arc( SCHEMATIC_MARGIN + SCHEMATIC_ARC_RADIUS * 7, 0, SCHEMATIC_ARC_RADIUS, Math.PI, 0, false )
  .lineTo( SCHEMATIC_WIDTH, 0 );

const LIFELIKE_HEIGHT = 60;
const LIFELIKE_WIDTH = CCKCConstants.INDUCTOR_LENGTH;
const LIFELIKE_RADIUS_X = 5;
const LIFELIKE_RADIUS_Y = LIFELIKE_HEIGHT / 2;
const LIFELIKE_WIRE_LINE_WIDTH = 4;
const LIFELIKE_PATH_OUTLINE_STYLES = new LineStyles( {
  lineWidth: LIFELIKE_WIRE_LINE_WIDTH,
  lineCap: 'round',
  lineJoin: 'round'
} );
const LIFELIKE_PATH_FILL_STYLES = new LineStyles( {
  lineWidth: LIFELIKE_WIRE_LINE_WIDTH - 1.5,
  lineCap: 'round',
  lineJoin: 'round'
} );

class InductorNode extends FixedCircuitElementNode {

  /**
   * @param {CCKCScreenView|null} screenView - main screen view, null for isIcon
   * @param {CircuitLayerNode|null} circuitLayerNode, null for icon
   * @param {Inductor} inductor
   * @param {Property.<CircuitElementViewType>} viewTypeProperty
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( screenView, circuitLayerNode, inductor, viewTypeProperty, tandem, options ) {

    options = merge( { isIcon: false, useHitTestForSensors: true }, options );

    // The main body, in front.
    const lifelikeBodyShape = new Shape()
      .ellipticalArc( LIFELIKE_WIDTH, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, -Math.PI / 2, Math.PI / 2, false )
      .ellipticalArc( 0, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, Math.PI / 2, -Math.PI / 2, true )
      .close();
    const lifelikeBodyPath = new Path( lifelikeBodyShape, { fill: 'white', stroke: 'black' } );

    // The elliptical edge shown to the left of the main body.
    const lifelikeEndCapShape = Shape.ellipse( 0, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, Math.PI * 2 );
    const lifelikeEndCapPath = new Path( lifelikeEndCapShape, {
      fill: '#c4c4c4',
      stroke: 'black'
    } );

    // Container that has individual wire loops.
    const wireWrapNode = new Node();
    inductor.inductanceProperty.link( inductance => {

      // Determine the number of loops, including the start and end segments, which are each half.
      const numLoops = Utils.roundSymmetric( Utils.linear( 10, 100, 5, 20, inductance ) );
      const children = [];
      for ( let i = 0; i < numLoops; i++ ) {

        // Loops for the main body, with special cases for the start end end loop, which are halved.
        const startAngle = i === numLoops - 1 ? Math.PI / 2 : -Math.PI / 2;
        const endAngle = i === 0 || i === numLoops - 1 ? 0 : Math.PI / 2;
        const anticounterclockwise = i === numLoops - 1;

        // Positioning for the loop arc
        const x = Utils.linear(
          numLoops / 2, numLoops / 2 + 1,
          LIFELIKE_WIDTH / 2 + LIFELIKE_RADIUS_X / 2, LIFELIKE_WIDTH / 2 + LIFELIKE_WIRE_LINE_WIDTH + LIFELIKE_RADIUS_X / 2,
          i );
        const pathShape = new Shape()
          .ellipticalArc( x, LIFELIKE_HEIGHT / 2, LIFELIKE_RADIUS_X, LIFELIKE_RADIUS_Y, 0, startAngle, endAngle, anticounterclockwise );

        // Wire segments for the start and end
        if ( i === 0 ) {
          pathShape.lineTo( 0, LIFELIKE_HEIGHT / 2 );
        }
        if ( i === numLoops - 1 ) {
          pathShape.lineTo( LIFELIKE_WIDTH + LIFELIKE_RADIUS_X, LIFELIKE_HEIGHT / 2 );
        }

        // Using a single path with fill+stroke leaves an artifact at the corners.  As a workaround, use two fills,
        // see https://github.com/phetsims/circuit-construction-kit-common/issues/537#issuecomment-558917786
        // and the corresponding kite issue https://github.com/phetsims/kite/issues/83
        const createPath = ( lineStyles, fill ) => new Path( pathShape.getStrokedShape( lineStyles ), { fill: fill } );
        children.push( createPath( LIFELIKE_PATH_OUTLINE_STYLES, 'black' ) );
        children.push( createPath( LIFELIKE_PATH_FILL_STYLES, '#dc9180' ) );
      }
      wireWrapNode.children = children;
    } );

    const lifelikeNode = new Node( {
      children: [ lifelikeEndCapPath, lifelikeBodyPath, wireWrapNode ],
      centerY: 0
    } );

    const scale = LIFELIKE_WIDTH / schematicShape.bounds.width;

    // Scale to fit the correct width
    const scaledShape = schematicShape.transformed( Matrix3.scale( scale, scale ) );
    const schematicNode = new Path( scaledShape, {
      stroke: Color.BLACK,
      lineWidth: CCKCConstants.SCHEMATIC_LINE_WIDTH
    } );

    // Expand the pointer areas with a defensive copy, see https://github.com/phetsims/circuit-construction-kit-common/issues/310
    schematicNode.mouseArea = schematicNode.bounds.dilated( 2 );
    schematicNode.touchArea = schematicNode.bounds.dilated( 2 );

    super(
      screenView,
      circuitLayerNode,
      inductor,
      viewTypeProperty,
      lifelikeNode,
      schematicNode,
      tandem,
      options
    );

    // @public (read-only) {Inductor}
    this.inductor = inductor;
  }
}

/**
 * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
 * @public {Array.<Image>}
 */
InductorNode.webglSpriteNodes = [];

circuitConstructionKitCommon.register( 'InductorNode', InductorNode );
export default InductorNode;