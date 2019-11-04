// Copyright 2019, University of Colorado Boulder

/**
 * IO type for CircuitElement
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const circuitConstructionKitCommon = require( 'CIRCUIT_CONSTRUCTION_KIT_COMMON/circuitConstructionKitCommon' );
  const CouldNotYetDeserializeError = require( 'TANDEM/CouldNotYetDeserializeError' );
  const ObjectIO = require( 'TANDEM/types/ObjectIO' );
  const validate = require( 'AXON/validate' );

  class CircuitElementIO extends ObjectIO {

    static toStateObject( circuitElement ) {
      validate( circuitElement, this.validator );
      return {
        startVertexID: circuitElement.startVertexProperty.value.tandem.phetioID,
        endVertexID: circuitElement.endVertexProperty.value.tandem.phetioID
      };
    }

    /**
     * @override
     * @param {Object} stateObject - see CircuitElementIO.toStateObject
     * @returns {Array.<*>}
     */
    static stateObjectToArgs( stateObject ) {
      if ( phet.phetIo.phetioEngine.hasPhetioObject( stateObject.startVertexID ) &&
           phet.phetIo.phetioEngine.hasPhetioObject( stateObject.endVertexID ) ) {
        return [
          phet.phetIo.phetioEngine.getPhetioObject( stateObject.startVertexID ),
          phet.phetIo.phetioEngine.getPhetioObject( stateObject.endVertexID )
        ];
      }
      else {
        throw new CouldNotYetDeserializeError();
      }
    }
  }

  CircuitElementIO.methods = {};
  CircuitElementIO.documentation = 'A Circuit Element, such as battery, resistor or wire';
  CircuitElementIO.validator = { isValidValue: v => v instanceof phet.circuitConstructionKitCommon.CircuitElement };
  CircuitElementIO.typeName = 'CircuitElementIO';
  ObjectIO.validateSubtype( CircuitElementIO );

  return circuitConstructionKitCommon.register( 'CircuitElementIO', CircuitElementIO );
} );