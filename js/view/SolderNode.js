// Copyright 2016-2017, University of Colorado Boulder

/**
 * Shows the silver solder at a connected vertex.  This is not interactive and is behind everything else.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Circle = require( 'SCENERY/nodes/Circle' );
  var Node = require( 'SCENERY/nodes/Node' );

  // constants
  var SOLDER_COLOR = '#ae9f9e';

  // @public (read-only) {number} - for hit testing with probes
  var SOLDER_RADIUS = 11.2;

  // {Image} raster created by init() for WebGL usage
  var CIRCLE_NODE = new Circle( SOLDER_RADIUS, { fill: SOLDER_COLOR } ).toDataURLImageSynchronous();

  /**
   * @param {CircuitLayerNode} circuitLayerNode
   * @param {Vertex} vertex
   * @constructor
   */
  function SolderNode( circuitLayerNode, vertex ) {
    assert && assert( CIRCLE_NODE, 'solder image should exist before creating SolderNode' );

    var self = this;

    // @private {boolean} - keep track of when the node was disposed because defensive copies for callbacks cause
    // listeners to get called during disposal
    this.solderNodeDisposed = false;

    var circuit = circuitLayerNode.circuit;

    // @public (read-only) {Vertex}
    this.vertex = vertex;

    // @public {Vector2|null} - added by CircuitLayerNode during dragging, used for relative drag location.
    this.startOffset = null;

    Node.call( this, {
      children: [ CIRCLE_NODE ],

      // Avoid bounds computation for this node since it is not pickable, and it was showing up in the profiler
      preventFit: true,
      pickable: false
    } );

    // Update the fill when the number of attached components changes.
    var updateFill = function() {

      //
      if ( self.solderNodeDisposed ) {
        return;
      }
      self.visible = circuit.countCircuitElements( vertex ) > 1;
    };
    circuit.vertices.addItemAddedListener( updateFill );
    circuit.vertices.addItemRemovedListener( updateFill );

    // In Black Box, other wires can be detached from a vertex and this should also update the solder
    circuit.circuitElements.addItemAddedListener( updateFill );
    circuit.circuitElements.addItemRemovedListener( updateFill );

    var updateSolderNodePosition = function( position ) {
      self.setTranslation( position.x, position.y );
    };
    vertex.positionProperty.link( updateSolderNodePosition );

    // @private (read-only) {function} called by dispose()
    this.disposeSolderNode = function() {
      vertex.positionProperty.unlink( updateSolderNodePosition );

      circuit.vertices.removeItemAddedListener( updateFill );
      circuit.vertices.removeItemRemovedListener( updateFill );

      // In Black Box, other wires can be detached from a vertex and this should also update the solder
      circuit.circuitElements.removeItemAddedListener( updateFill );
      circuit.circuitElements.removeItemRemovedListener( updateFill );
    };

    updateFill();
  }

  circuitConstructionKitCommon.register( 'SolderNode', SolderNode );

  return inherit( Node, SolderNode, {

    /**
     * Eliminate resources when no longer used.
     * @public
     * @override
     */
    dispose: function() {
      this.solderNodeDisposed = true;
      this.disposeSolderNode();
      Node.prototype.dispose.call( this );
    }
  }, {

    /**
     * Identifies the images used to render this node so they can be prepopulated in the WebGL sprite sheet.
     * @public {Array.<Image>}
     */
    webglSpriteNodes: [ CIRCLE_NODE ],

    SOLDER_RADIUS: SOLDER_RADIUS
  } );
} );