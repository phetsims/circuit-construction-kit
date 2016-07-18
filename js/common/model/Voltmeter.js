// Copyright 2016, University of Colorado Boulder
// TODO: Review, document, annotate, i18n, bring up to standards

/**
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var Meter = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/common/model/Meter' );

  function Voltmeter( tandem ) {
    Meter.call( this, {
      voltage: null, // Null means no reading, otherwise {number} volts
      redProbePosition: new Vector2( 0, 0 ),
      blackProbePosition: new Vector2( 0, 0 )
    }, tandem, {
      voltage: tandem.createTandem( 'voltageProperty' ),
      redProbePosition: tandem.createTandem( 'redProbePositionProperty' ),
      blackProbePosition: tandem.createTandem( 'blackProbePositionProperty' )
    } );
  }

  circuitConstructionKitCommon.register( 'Voltmeter', Voltmeter );

  return inherit( Meter, Voltmeter );
} );