// Copyright 2015-2021, University of Colorado Boulder

/**
 * Model for a resistor.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import validate from '../../../axon/js/validate.js';
import Range from '../../../dot/js/Range.js';
import Enumeration from '../../../phet-core/js/Enumeration.js';
import EnumerationIO from '../../../phet-core/js/EnumerationIO.js';
import merge from '../../../phet-core/js/merge.js';
import IOType from '../../../tandem/js/types/IOType.js';
import CCKCConstants from '../CCKCConstants.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import CircuitElement from './CircuitElement.js';
import FixedCircuitElement from './FixedCircuitElement.js';

class Resistor extends FixedCircuitElement {

  /**
   * @param {Vertex} startVertex
   * @param {Vertex} endVertex
   * @param {Resistor.ResistorType} resistorType
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( startVertex, endVertex, resistorType, tandem, options ) {
    options = merge( {
      isFlammable: true, // All resistors are flammable except for the dog, which automatically disconnects at high current.
      phetioType: Resistor.ResistorIO,
      numberOfDecimalPlaces: resistorType === Resistor.ResistorType.RESISTOR ? 1 : 0
    }, options );

    assert && assert( !options.hasOwnProperty( 'resistance' ), 'Resistance should be passed through resistorType' );

    // validate resistor type
    validate( resistorType, { valueType: Resistor.ResistorType } );

    // @public (read-only)
    assert && assert( !options.hasOwnProperty( 'isMetallic' ), 'isMetallic is given by the resistorType' );
    options.isMetallic = resistorType.isMetallic;

    super( startVertex, endVertex, resistorType.length, tandem, options );

    // @public (read-only) {Resistor.ResistorType} indicates one of ResistorType values
    this.resistorType = resistorType;

    assert && assert( typeof this.resistorType.isMetallic === 'boolean' );

    // @public {Property.<number>} the resistance in ohms
    this.resistanceProperty = new NumberProperty( resistorType.defaultResistance, {
      tandem: tandem.createTandem( 'resistanceProperty' ),

      // Specify the Property range for seamless PhET-iO interoperation
      range: this.resistorType.range
    } );
  }

  /**
   * Dispose of this and PhET-iO instrumented children, so they will be unregistered.
   * @public
   */
  dispose() {
    this.resistanceProperty.dispose();
    super.dispose();
  }

  /**
   * Returns true if the resistance is editable.  Household item resistance is not editable.
   * @returns {boolean}
   * @public
   */
  isResistanceEditable() {
    return this.resistorType === Resistor.ResistorType.HIGH_RESISTANCE_RESISTOR ||
           this.resistorType === Resistor.ResistorType.RESISTOR;
  }

  /**
   * Get the properties so that the circuit can be solved when changed.
   * @override
   * @returns {Property.<*>[]}
   * @public
   */
  getCircuitProperties() {
    return [ this.resistanceProperty ];
  }
}

/**
 * Values for the ResistorTypeEnum
 */
class ResistorEnumValue {

  /**
   * @param {number} defaultResistance - default value for resistance, in Ohms
   * @param {Range} resistanceRange - possible values for the resistance, in Ohms
   * @param {number} length
   * @param {Object} [options]
   */
  constructor( defaultResistance, resistanceRange, length, options ) {

    options = merge( {
      verticalOffset: 0,
      isMetallic: false, // whether the item is metallic (non-insulated) and hence can have its value read at any point
      isInsulator: false
    }, options );

    // @public (read-only) {number} - in Ohms
    this.defaultResistance = defaultResistance;

    // @public (read-only) {Range} - in Ohms
    this.range = resistanceRange;

    // @public (read-only} {number} - in view coordinates
    this.length = length;

    // @public (read-only) {number} - amount the view is shifted down in view coordinates
    this.verticalOffset = options.verticalOffset;

    // @public (read-only) {boolean}
    this.isInsulator = options.isInsulator;

    // @public (read-only) {boolean}
    this.isMetallic = options.isMetallic;
  }

  /**
   * Convenience function for creating a fixed-resistance resistor, like a household item.
   * @param {number} resistance
   * @param {number} length
   * @param {Object} [options]
   * @returns {ResistorEnumValue}
   * @public
   */
  static fixed( resistance, length, options ) {
    return new ResistorEnumValue( resistance, new Range( resistance, resistance ), length, options );
  }
}

// @public {Enumeration} - Enumeration for the different resistor types.
Resistor.ResistorType = Enumeration.byMap( {
  RESISTOR: new ResistorEnumValue( 10, new Range( 0, 120 ), CCKCConstants.RESISTOR_LENGTH ),
  HIGH_RESISTANCE_RESISTOR: new ResistorEnumValue( 1000, new Range( 100, 10000 ), CCKCConstants.RESISTOR_LENGTH ),
  COIN: ResistorEnumValue.fixed( 0, CCKCConstants.COIN_LENGTH, { isMetallic: true } ),
  PAPER_CLIP: ResistorEnumValue.fixed( 0, CCKCConstants.PAPER_CLIP_LENGTH, { isMetallic: true } ),
  PENCIL: ResistorEnumValue.fixed( 25, CCKCConstants.PENCIL_LENGTH ),
  ERASER: ResistorEnumValue.fixed( 0, CCKCConstants.ERASER_LENGTH, { isInsulator: true } ),
  HAND: ResistorEnumValue.fixed( 100000, CCKCConstants.HAND_LENGTH, { verticalOffset: 15 } ),

  // Adjust the dog so the charges travel along the tail/legs, see https://github.com/phetsims/circuit-construction-kit-common/issues/364
  DOG: ResistorEnumValue.fixed( 100000, CCKCConstants.DOG_LENGTH, { verticalOffset: -40 } ),
  DOLLAR_BILL: ResistorEnumValue.fixed( 0, CCKCConstants.DOLLAR_BILL_LENGTH, { isInsulator: true } )
} );

// @public {IOType}
Resistor.ResistorIO = new IOType( 'ResistorIO', {
  valueType: Resistor,
  supertype: CircuitElement.CircuitElementIO,
  stateSchema: {
    resistorType: EnumerationIO( Resistor.ResistorType )
  },
  toStateObject: resistor => {
    const stateObject = CircuitElement.CircuitElementIO.toStateObject( resistor );
    stateObject.resistorType = EnumerationIO( Resistor.ResistorType ).toStateObject( resistor.resistorType );
    return stateObject;
  },
  stateToArgsForConstructor( stateObject ) {
    const args = CircuitElement.CircuitElementIO.stateToArgsForConstructor( stateObject );
    args.push( EnumerationIO( Resistor.ResistorType ).fromStateObject( stateObject.resistorType ) );
    return args;
  }
} );

circuitConstructionKitCommon.register( 'Resistor', Resistor );
export default Resistor;