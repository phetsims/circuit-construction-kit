// Copyright 2017-2020, University of Colorado Boulder

/**
 * Readout that appears in the CircuitElementEditContainerNode that displays whether the switch is open or closed.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import Node from '../../../scenery/js/nodes/Node.js';
import Text from '../../../scenery/js/nodes/Text.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';

const theSwitchIsClosedString = circuitConstructionKitCommonStrings.theSwitchIsClosed;
const theSwitchIsOpenString = circuitConstructionKitCommonStrings.theSwitchIsOpen;

// constants
const MAX_TEXT_WIDTH = 300;

class SwitchReadoutNode extends Node {

  /**
   * @param {Circuit} circuit - the circuit from which the switch can be removed when the trash button is pressed
   * @param {Switch} circuitSwitch - the switch
   * @param {Tandem} tandem
   * @param {TrashButton} trashButton
   */
  constructor( circuit, circuitSwitch, tandem, trashButton ) {

    // Create both texts and display both so they remain aligned as the value changes
    const closedText = new Text( theSwitchIsClosedString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );
    const openText = new Text( theSwitchIsOpenString, {
      fontSize: 24,
      maxWidth: MAX_TEXT_WIDTH
    } );

    const maxWidth = Math.max( closedText.width, openText.width );

    const closedListener = closed => {
      closedText.visible = closed;
      openText.visible = !closed;
    };
    circuitSwitch.closedProperty.link( closedListener );

    // Show a trash button to the right of the text
    trashButton.mutate( {
      left: maxWidth + 10,
      centerY: closedText.centerY
    } );

    super( {
      children: [ closedText, openText, trashButton ]
    } );

    // @private {function}
    this.disposeSwitchReadoutNode = () => circuitSwitch.closedProperty.unlink( closedListener );
  }

  /**
   * @public - dispose when no longer used
   * @override
   */
  dispose() {
    this.disposeSwitchReadoutNode();
    super.dispose();
  }
}

circuitConstructionKitCommon.register( 'SwitchReadoutNode', SwitchReadoutNode );
export default SwitchReadoutNode;