/**
 * card-swatch/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  classNames:['card-swatch'],
  cardProperties:null,
  layoutCoordinator: Ember.inject.service('layout-coordinator'),

  mouseDown(event){
    console.log('card-swatch:mouseDown...');
    if (this.get('disableEvents')){
      return;
    }
    let lc = this.get('layoutCoordinator');
    // let layoutEditor = this.get('cardComponent.layoutEditor');
    lc.set('activeEventsHandler', this);
    //
    // let sourceComponent = this.get('cardComponent').$()[0];
    //let relativeMousePosition = mouseOffset(event);
    let relativeMousePosition = {
      left: event.originalEvent.clientX + window.pageXOffset,
      top: event.originalEvent.clientY + window.pageYOffset
    };
    //set the mousemove & mouse up handlers for the page-layout-editor to be
    //local functions
    // Check if the user is actually dragging the element
    function mousemove(evt) {

      let newRelativeMousePosition = {
        left: evt.originalEvent.clientX + window.pageXOffset,
        top: evt.originalEvent.clientY + window.pageYOffset
      };

      if (Math.abs(relativeMousePosition.left - newRelativeMousePosition.left) < 2 && Math.abs(relativeMousePosition.top - newRelativeMousePosition.top) < 2) {
        relativeMousePosition = newRelativeMousePosition;
        return;
      }
      console.log('Swatch is being dragged...');

      lc.startDragging({
        sourceLayoutElement: null,
        mousePosition: newRelativeMousePosition,
        type: 'card'
      });

      // Use off, we don't want to set the activeEventsHandler to null since the wheel will take ownership.
      off();
    }
    function off() {
      // layoutEditor.$().off('mousemove', mousemove);
      // layoutEditor.$().off('mouseup', mouseup);
      console.log('card-swatch lc.clearMouseHandlers');
      lc.clearMouseHandlers(mousemove,mouseup);

    }

    let self = this;

    function mouseup() {
      console.log('card-swatch:mouseDown:fn:mouseUp caught');
      lc.set('activeEventsHandler',null);
      off();
    }
    lc.setMouseHandlers(mousemove, mouseup);
    // layoutEditor.$().on('mousemove', mousemove);
    // layoutEditor.$().on('mouseup', mouseup);

    return true;
  }

});
