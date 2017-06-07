// Copyright 2015-2017, University of Colorado Boulder

/**
 * The Battery is a circuit element that provides a fixed voltage difference.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var CircuitConstructionKitConstants = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/CircuitConstructionKitConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var FixedLengthCircuitElement = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/model/FixedLengthCircuitElement' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Range = require( 'DOT/Range' );

  // constants
  var BATTERY_LENGTH = CircuitConstructionKitConstants.BATTERY_LENGTH;

  /**
   * @param {Vertex} startVertex - one of the battery vertices
   * @param {Vertex} endVertex - the other battery vertex
   * @param {Property.<number>} resistanceProperty - the resistance of the battery
   * @param {string} batteryType - 'normal' | 'high-voltage'
   * @param {Tandem} tandem
   * @param {Object} [options]
   * @constructor
   */
  function Battery( startVertex, endVertex, resistanceProperty, batteryType, tandem, options ) {
    assert && assert( batteryType === 'normal' || batteryType === 'high-voltage', 'Illegal battery type: ' + batteryType );

    options = _.extend( {
      initialOrientation: 'right',
      voltage: batteryType === 'normal' ? 9.0 : 10000
    }, options );
    FixedLengthCircuitElement.call( this, startVertex, endVertex, BATTERY_LENGTH, BATTERY_LENGTH, tandem, {
      editableRange: batteryType === 'normal' ? new Range( 0, 100 ) : new Range( 100, 100000 )
    } );

    // @public (read-only) the voltage of the battery
    this.voltageProperty = new NumberProperty( options.voltage );

    // @public (read-only) the internal resistance of the battery
    this.internalResistanceProperty = resistanceProperty;

    // @public (read-only) - track the initial state so the user can only create a certain number of "left" or "right"
    // batteries from the toolbox.
    this.initialOrientation = options.initialOrientation;

    // @public (read-only) - the type of the battery - 'normal' | 'high-voltage'
    this.batteryType = batteryType;
  }

  circuitConstructionKitCommon.register( 'Battery', Battery );

  return inherit( FixedLengthCircuitElement, Battery, {

    /**
     * Get the properties so that the circuit can be solved when changed.
     * @override
     * @returns {Property[]}
     * @public
     */
    getCircuitProperties: function() {
      return [ this.voltageProperty ];
    },

    /**
     * @returns {Object} the attributes of the battery in a state object
     * @public
     */
    attributesToStateObject: function() {
      return {
        voltage: this.voltageProperty.get(),
        internalResistance: this.internalResistanceProperty.get()
      };
    }
  } );
} );