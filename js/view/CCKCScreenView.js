// Copyright 2015-2021, University of Colorado Boulder

/**
 * Node that represents a single scene or screen, with a circuit, toolbox, sensors, etc. Exists for the life of the sim
 * and hence does not require a dispose implementation.
 *
 * @author Sam Reid (PhET Interactive Simulations)
 */

import NumberProperty from '../../../axon/js/NumberProperty.js';
import Property from '../../../axon/js/Property.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import merge from '../../../phet-core/js/merge.js';
import PlayPauseButton from '../../../scenery-phet/js/buttons/PlayPauseButton.js';
import ResetAllButton from '../../../scenery-phet/js/buttons/ResetAllButton.js';
import StopwatchNode from '../../../scenery-phet/js/StopwatchNode.js';
import TimeControlNode from '../../../scenery-phet/js/TimeControlNode.js';
import KeyboardUtils from '../../../scenery/js/accessibility/KeyboardUtils.js';
import AlignBox from '../../../scenery/js/nodes/AlignBox.js';
import AlignGroup from '../../../scenery/js/nodes/AlignGroup.js';
import Node from '../../../scenery/js/nodes/Node.js';
import VBox from '../../../scenery/js/nodes/VBox.js';
import Tandem from '../../../tandem/js/Tandem.js';
import CCKCConstants from '../CCKCConstants.js';
import CCKCQueryParameters from '../CCKCQueryParameters.js';
import circuitConstructionKitCommon from '../circuitConstructionKitCommon.js';
import circuitConstructionKitCommonStrings from '../circuitConstructionKitCommonStrings.js';
import SeriesAmmeter from '../model/SeriesAmmeter.js';
import AdvancedAccordionBox from './AdvancedAccordionBox.js';
import AmmeterNode from './AmmeterNode.js';
import ChargeSpeedThrottlingReadoutNode from './ChargeSpeedThrottlingReadoutNode.js';
import CircuitElementEditContainerNode from './CircuitElementEditContainerNode.js';
import CircuitElementToolbox from './CircuitElementToolbox.js';
import CircuitLayerNode from './CircuitLayerNode.js';
import CurrentChartNode from './CurrentChartNode.js';
import DisplayOptionsPanel from './DisplayOptionsPanel.js';
import SensorToolbox from './SensorToolbox.js';
import ViewRadioButtonGroup from './ViewRadioButtonGroup.js';
import VoltageChartNode from './VoltageChartNode.js';
import VoltmeterNode from './VoltmeterNode.js';
import ZoomControlPanel from './ZoomControlPanel.js';

const batteryResistanceString = circuitConstructionKitCommonStrings.batteryResistance;
const sourceResistanceString = circuitConstructionKitCommonStrings.sourceResistance;

// constants
const VERTICAL_MARGIN = CCKCConstants.VERTICAL_MARGIN;

// Match margins with the carousel page control and spacing
const HORIZONTAL_MARGIN = CCKCConstants.HORIZONTAL_MARGIN;

// Group for aligning the content in the panels and accordion boxes.  This is a class variable instead of an
// instance variable so the control panels will have the same width across all screens,
// see https://github.com/phetsims/circuit-construction-kit-dc/issues/9
const CONTROL_PANEL_ALIGN_GROUP = new AlignGroup( {

  // Elements should have the same widths but not constrained to have the same heights
  matchVertical: false
} );

// Support accessibility for deleting selected circuit elements, but don't support broader tab navigation until it
// is complete
document.addEventListener( 'keydown', event => {
  if ( KeyboardUtils.isKeyEvent( event, KeyboardUtils.KEY_TAB ) ) {
    event.preventDefault();
  }
} );

class CCKCScreenView extends ScreenView {

  /**
   * @param {CircuitConstructionKitModel} model
   * @param {CircuitElementToolNode[]} circuitElementToolNodes - to be shown in the carousel
   * @param {Tandem} tandem
   * @param {Object} [options]
   */
  constructor( model, circuitElementToolNodes, tandem, options ) {

    options = merge( {

      // When used as a scene, the reset all button is suppressed here, added in the screen so that it may reset all
      // scenes (including but not limited to this one).
      showResetAllButton: true,

      /* SEE ALSO OPTIONS IN CircuitElementToolbox*/

      showSeriesAmmeters: false,
      showTimeControls: false,
      showNoncontactAmmeters: true,
      getCircuitEditPanelLayoutPosition: CircuitElementEditContainerNode.GET_LAYOUT_POSITION,
      showAdvancedControls: true,
      showCharts: false,
      blackBoxStudy: false,
      showStopwatchCheckbox: false,
      showPhaseShiftControl: false,
      hasACandDCVoltageSources: false // determines the string shown in the AdvancedAccordionBox
    }, options );

    super( { tandem: tandem } );

    // @public (read-only) {CircuitConstructionKitModel}
    this.model = model;

    // TODO (black-box-study): change background color to gray when isValueDepictionEnabledProperty goes false

    // @private - contains parts of the circuit that should be shown behind the controls
    this.circuitLayerNodeBackLayer = new Node();

    // @public (read-only) {CircuitLayerNode} - the circuit node
    this.circuitLayerNode = new CircuitLayerNode(
      model.circuit, this, tandem.createTandem( 'circuitLayerNode' )
    );

    const voltmeterNodes = model.voltmeters.map( voltmeter => {
      const voltmeterTandem = tandem.createTandem( `voltmeterNode${voltmeter.phetioIndex}` );
      const voltmeterNode = new VoltmeterNode( voltmeter, model, this.circuitLayerNode, voltmeterTandem, {
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty
      } );
      voltmeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          voltmeter.visibleProperty.value = false;
        }
      } );
      return voltmeterNode;
    } );

    const ammeterNodes = model.ammeters.map( ammeter => {
      const ammeterNode = new AmmeterNode( ammeter, this.circuitLayerNode, {
        tandem: tandem.createTandem( `ammeterNode${ammeter.phetioIndex}` ), // TODO (phet-io): Group?
        showResultsProperty: model.isValueDepictionEnabledProperty,
        visibleBoundsProperty: this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty,
        blackBoxStudy: options.blackBoxStudy
      } );
      ammeter.droppedEmitter.addListener( bodyNodeGlobalBounds => {
        if ( bodyNodeGlobalBounds.intersectsBounds( this.sensorToolbox.globalBounds ) ) {
          ammeter.visibleProperty.value = false;
        }
      } );
      return ammeterNode;
    } );

    // @private {Array.<CurrentChartNode>}
    this.chartNodes = [];

    // Optionally initialize the chart nodes
    if ( options.showCharts ) {

      const createVoltageChartNode = tandemName => {
        const voltageChartNode = new VoltageChartNode( this.circuitLayerNode, model.circuit.timeProperty,
          this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty, {
            tandem: tandem.createTandem( tandemName )
          }
        );
        voltageChartNode.initializeBodyDragListener( this );
        return voltageChartNode;
      };
      const createCurrentChartNode = tandemName => {
        const currentChartNode = new CurrentChartNode( this.circuitLayerNode, model.circuit.timeProperty,
          this.circuitLayerNode.visibleBoundsInCircuitCoordinateFrameProperty, {
            tandem: tandem.createTandem( tandemName )
          }
        );
        currentChartNode.initializeBodyDragListener( this );
        return currentChartNode;
      };

      // @private {CurrentChartNode}
      this.voltageChartNode1 = createVoltageChartNode( 'voltageChartNode1' );
      this.voltageChartNode2 = createVoltageChartNode( 'voltageChartNode2' );

      // @private {CurrentChartNode}
      this.currentChartNode1 = createCurrentChartNode( 'currentChartNode1' );
      this.currentChartNode2 = createCurrentChartNode( 'currentChartNode2' );

      this.chartNodes.push( this.voltageChartNode1, this.voltageChartNode2, this.currentChartNode1, this.currentChartNode2 );
    }

    // @public (read-only) {CircuitElementToolbox} - Toolbox from which CircuitElements can be dragged
    this.circuitElementToolbox = new CircuitElementToolbox(
      model.viewTypeProperty,
      circuitElementToolNodes,
      tandem.createTandem( 'circuitElementToolbox' ),
      options.circuitElementToolboxOptions
    );

    // @protected {SensorToolbox} - so that subclasses can add a layout circuit element near it
    this.sensorToolbox = new SensorToolbox(
      CONTROL_PANEL_ALIGN_GROUP,
      this.circuitLayerNode,
      voltmeterNodes,
      ammeterNodes,
      [ this.voltageChartNode1, this.voltageChartNode2 ],
      [ this.currentChartNode1, this.currentChartNode2 ],
      tandem.createTandem( 'sensorToolbox' ), {
        showSeriesAmmeters: options.showSeriesAmmeters,
        showNoncontactAmmeters: options.showNoncontactAmmeters,
        showCharts: options.showCharts
      } );

    // @private {ViewRadioButtonGroup}
    this.viewRadioButtonGroup = new ViewRadioButtonGroup(
      model.viewTypeProperty,
      tandem.createTandem( 'viewRadioButtonGroup' ), {
        maxWidth: this.circuitElementToolbox.carousel.backgroundWidth
      }
    );
    this.viewRadioButtonGroup.mutate( { scale: this.circuitElementToolbox.carousel.backgroundWidth / this.viewRadioButtonGroup.width * CCKCConstants.CAROUSEL_SCALE } );

    // @protected {DisplayOptionsPanel}
    this.displayOptionsPanel = new DisplayOptionsPanel(
      CONTROL_PANEL_ALIGN_GROUP,
      model.circuit.showCurrentProperty,
      model.circuit.currentTypeProperty,
      model.showValuesProperty,
      model.showLabelsProperty,
      model.stopwatch,
      options.showStopwatchCheckbox,
      tandem.createTandem( 'displayOptionsPanel' )
    );

    // @private {AdvancedAccordionBox}
    this.advancedAccordionBox = new AdvancedAccordionBox(
      model.circuit,
      CONTROL_PANEL_ALIGN_GROUP,
      options.hasACandDCVoltageSources ? sourceResistanceString : batteryResistanceString,
      tandem.createTandem( 'advancedAccordionBox' ), {
        showRealBulbsCheckbox: !options.hasACandDCVoltageSources
      }
    );

    this.addChild( this.circuitLayerNodeBackLayer );

    // Reset All button
    let resetAllButton = null;
    if ( options.showResetAllButton ) {
      resetAllButton = new ResetAllButton( {
        tandem: tandem.createTandem( 'resetAllButton' ),
        listener: () => {
          model.reset();
          this.reset();
        }
      } );
      this.addChild( resetAllButton );
    }

    this.addChild( this.circuitElementToolbox );
    this.addChild( this.viewRadioButtonGroup );

    const controlPanelVBox = new VBox( {
      spacing: VERTICAL_MARGIN,
      children: options.showAdvancedControls ?
        [ this.displayOptionsPanel, this.sensorToolbox, this.advancedAccordionBox ] :
        [ this.displayOptionsPanel, this.sensorToolbox ]
    } );

    const box = new AlignBox( controlPanelVBox, {
      xAlign: 'right',
      yAlign: 'top',
      xMargin: HORIZONTAL_MARGIN,
      yMargin: VERTICAL_MARGIN
    } );
    this.visibleBoundsProperty.linkAttribute( box, 'alignBounds' );

    this.addChild( box );
    this.addChild( this.circuitLayerNode );

    const chargeSpeedThrottlingReadoutNode = new ChargeSpeedThrottlingReadoutNode(
      model.circuit.chargeAnimator.timeScaleProperty,
      model.circuit.showCurrentProperty,
      model.isValueDepictionEnabledProperty
    );
    this.addChild( chargeSpeedThrottlingReadoutNode );

    // The center between the left toolbox and the right control panels
    const playAreaCenterXProperty = new NumberProperty( 0 );

    const circuitElementEditContainerNode = new CircuitElementEditContainerNode(
      model.circuit,
      this.visibleBoundsProperty,
      model.modeProperty,
      playAreaCenterXProperty,
      tandem.createTandem( 'circuitElementEditContainerNode' ), {
        showPhaseShiftControl: options.showPhaseShiftControl
      }
    );

    this.addChild( circuitElementEditContainerNode );

    // The voltmeter and ammeter are rendered with the circuit node so they will scale up and down with the circuit
    voltmeterNodes.forEach( voltmeterNode => this.circuitLayerNode.sensorLayer.addChild( voltmeterNode ) );
    ammeterNodes.forEach( ammeterNode => this.circuitLayerNode.sensorLayer.addChild( ammeterNode ) );
    this.chartNodes.forEach( chartNode => this.circuitLayerNode.sensorLayer.addChild( chartNode ) );

    // Create the zoom control panel
    const zoomControlPanel = new ZoomControlPanel( model.selectedZoomProperty, {
      tandem: tandem.createTandem( 'zoomControlPanel' )
    } );
    zoomControlPanel.mutate( {
      scale: this.circuitElementToolbox.carousel.backgroundWidth / zoomControlPanel.width * CCKCConstants.CAROUSEL_SCALE
    } );

    // Add the optional Play/Pause button
    if ( CCKCQueryParameters.showDepictValuesToggleButton ) {
      const playPauseButton = new PlayPauseButton( model.isValueDepictionEnabledProperty, {
        tandem: tandem.createTandem( 'playPauseButton' ),
        baseColor: '#33ff44' // the default blue fades into the background too much
      } );
      this.addChild( playPauseButton );
      this.visibleBoundsProperty.link( visibleBounds => {

        // Float the playPauseButton to the bottom left
        playPauseButton.mutate( {
          left: visibleBounds.left + VERTICAL_MARGIN,
          bottom: visibleBounds.bottom - VERTICAL_MARGIN - zoomControlPanel.height - VERTICAL_MARGIN
        } );
      } );
    }

    let timeControlNode = null;
    if ( options.showTimeControls ) {
      timeControlNode = new TimeControlNode( model.isPlayingProperty, {
        tandem: tandem.createTandem( 'timeControlNode' ),
        playPauseStepButtonOptions: {
          stepForwardButtonOptions: {
            listener: () => model.stepSingleStep()
          }
        }
      } );
      this.addChild( timeControlNode );
    }

    // Add it in front of everything (should never be obscured by a CircuitElement)
    this.addChild( zoomControlPanel );

    this.visibleBoundsProperty.link( visibleBounds => {

      this.circuitElementToolbox.left = visibleBounds.left + VERTICAL_MARGIN +
                                        ( this.circuitElementToolbox.carousel ? 0 : 12 );
      this.circuitElementToolbox.top = visibleBounds.top + VERTICAL_MARGIN;
      this.viewRadioButtonGroup.top = this.circuitElementToolbox.bottom + 14;
      this.viewRadioButtonGroup.centerX = this.circuitElementToolbox.right - this.circuitElementToolbox.carousel.width / 2;

      // Float the resetAllButton to the bottom right
      options.showResetAllButton && resetAllButton.mutate( {
        right: visibleBounds.right - HORIZONTAL_MARGIN,
        bottom: visibleBounds.bottom - HORIZONTAL_MARGIN
      } );

      timeControlNode && timeControlNode.mutate( {
        left: controlPanelVBox.left,
        bottom: visibleBounds.bottom - HORIZONTAL_MARGIN
      } );

      zoomControlPanel.left = visibleBounds.left + HORIZONTAL_MARGIN;
      zoomControlPanel.bottom = visibleBounds.bottom - VERTICAL_MARGIN;

      playAreaCenterXProperty.value = ( controlPanelVBox.left + this.circuitElementToolbox.right ) / 2;

      chargeSpeedThrottlingReadoutNode.mutate( {
        centerX: playAreaCenterXProperty.value,
        bottom: visibleBounds.bottom - 100 // so it doesn't overlap the component controls
      } );
    } );

    // Center the circuit node so that zooms will remain centered.
    this.circuitLayerNode.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );
    this.circuitLayerNodeBackLayer.setTranslation( this.layoutBounds.centerX, this.layoutBounds.centerY );

    // Continuously zoom in and out as the current zoom interpolates, and update when the visible bounds change
    Property.multilink( [ model.currentZoomProperty, this.visibleBoundsProperty ], ( currentZoom, visibleBounds ) => {
      this.circuitLayerNode.setScaleMagnitude( currentZoom );
      this.circuitLayerNodeBackLayer.setScaleMagnitude( currentZoom );
      this.circuitLayerNode.updateTransform( visibleBounds );
    } );

    // When a Vertex is dropped and the CircuitElement is over the CircuitElementToolbox, the CircuitElement will go back
    // into the toolbox
    this.model.circuit.vertexDroppedEmitter.addListener( vertex => {

      const neighbors = this.model.circuit.getNeighborCircuitElements( vertex );
      if ( neighbors.length === 1 ) {
        const circuitElement = neighbors[ 0 ];
        const circuitElementNode = this.circuitLayerNode.getCircuitElementNode( circuitElement );

        if ( this.canNodeDropInToolbox( circuitElementNode ) ) {
          this.model.circuit.disposeCircuitElement( circuitElement );
        }
      }
    } );

    // Re-render after setting state
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
      this.step( 1 / 60 );
    } );

    // @private - note whether the stopwatch should be repositioned when selected.  Otherwise it remembers its position
    this.stopwatchNodePositionDirty = true;

    // @public - the StopwatchNode
    if ( options.showStopwatchCheckbox ) {
      const stopwatchNode = new StopwatchNode( model.stopwatch, {
        dragBoundsProperty: this.visibleBoundsProperty,
        right: controlPanelVBox.left - HORIZONTAL_MARGIN,
        numberDisplayOptions: {
          numberFormatter: StopwatchNode.createRichTextNumberFormatter( {
            numberOfDecimalPlaces: 1
          } )
        },
        tandem: tandem.createTandem( 'stopwatchNode' )
      } );
      this.addChild( stopwatchNode );

      // Show the StopwatchNode when the checkbox is checked
      model.stopwatch.isVisibleProperty.link( isVisible => {
        if ( isVisible && this.stopwatchNodePositionDirty ) {

          // Compute bounds lazily now that everything is attached to the scene graph
          model.stopwatch.positionProperty.value = new Vector2(
            controlPanelVBox.left - stopwatchNode.width - 10,

            // center the text are vertically on the checkbox, so the non-draggable buttons aren't right next to the checkbox
            this.globalToLocalBounds( this.displayOptionsPanel.stopwatchCheckbox.globalBounds ).centerY - stopwatchNode.height * 0.2
          );
          this.stopwatchNodePositionDirty = false;
        }
      } );
    }

    model.stepEmitter.addListener( dt => this.stepOnce( dt ) );
  }

  /**
   * Called from model steps
   * @public
   *
   * @param {number} dt
   */
  stepOnce( dt ) {

    // If the step is large, it probably means that the screen was hidden for a while, so just ignore it.
    // see https://github.com/phetsims/circuit-construction-kit-common/issues/476
    if ( dt >= CCKCConstants.MAX_DT ) {
      return;
    }

    this.chartNodes.forEach( chartNode => chartNode.step( this.model.circuit.timeProperty.value, dt ) );
  }

  /**
   * Move forward in time by the specified dt
   * @param {number} dt - seconds
   * @public
   */
  step( dt ) {

    // noting from the main step
    this.circuitLayerNode.step( dt );
  }

  /**
   * Overrideable stub for resetting
   * @public
   */
  reset() {
    this.stopwatchNodePositionDirty = true;
    this.circuitElementToolbox.reset();
    this.advancedAccordionBox.expandedProperty.reset();
    this.chartNodes.forEach( chartNode => chartNode.reset() );
  }

  /**
   * Return true if and only if the CircuitElementNode can be dropped in the toolbox.
   * @param {CircuitElementNode} circuitElementNode
   * @returns {boolean}
   * @public
   */
  canNodeDropInToolbox( circuitElementNode ) {
    const circuitElement = circuitElementNode.circuitElement;

    // Only single (unconnected) elements can be dropped into the toolbox
    const isSingle = this.model.circuit.isSingle( circuitElement );

    // SeriesAmmeters should be dropped in the sensor toolbox
    const toolbox = circuitElement instanceof SeriesAmmeter ? this.sensorToolbox : this.circuitElementToolbox;

    // Detect whether the midpoint between the vertices overlaps the toolbox
    const globalMidpoint = circuitElementNode.localToGlobalPoint( circuitElement.getMidpoint() );
    const overToolbox = toolbox.globalBounds.containsPoint( globalMidpoint );

    return isSingle && overToolbox && circuitElement.canBeDroppedInToolbox;
  }
}

circuitConstructionKitCommon.register( 'CCKCScreenView', CCKCScreenView );
export default CCKCScreenView;