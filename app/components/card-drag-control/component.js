/**
 * card-drag-control/component.js
 */
import Ember from 'ember';

export default Ember.Component.extend({
  tagName:'span',
  classNames:['layout-control', 'pull-left'],
  cardComponent:null,
  layoutCoordinator: Ember.inject.service('layout-coordinator'),
  // mouseUp(event){
  //   let lc = this.get('cardComponent').get('lc');
  //
  // },
  mouseDown(event){
    console.log('card-drag-control:mouseDown...');
    if (this.get('disableEvents')){
      return;
    }

    let lc = this.get('layoutCoordinator');
    lc.set('activeEventsHandler', this);
    // if(!lc || !element){
    //   return true;
    // }

    let sourceComponent = this.get('cardComponent').$()[0];
    //let relativeMousePosition = mouseOffset(event);
    let relativeMousePosition = {
      left: event.originalEvent.clientX + window.pageXOffset,
      top: event.originalEvent.clientY + window.pageYOffset
    };
    //set the mousemove & mouse up handlers for the page-layout-editor to be
    //local functions
    // Check if the user is actually dragging the element
    function mousemove(evt) {
      //let newRelativeMousePosition = mouseOffset(evt);
      let newRelativeMousePosition = {
        left: evt.originalEvent.clientX + window.pageXOffset,
        top: evt.originalEvent.clientY + window.pageYOffset
      };

      if (Math.abs(relativeMousePosition.left - newRelativeMousePosition.left) < 2 && Math.abs(relativeMousePosition.top - newRelativeMousePosition.top) < 2) {
        relativeMousePosition = newRelativeMousePosition;
        return;
      }

      lc.startDragging({
        sourceLayoutElement: sourceComponent,
        mousePosition: newRelativeMousePosition
      });

      // Use off, we don't want to set the activeEventsHandler to null since the wheel will take ownership.
      off();
    }
    function off() {
      // lc.$().off('mousemove', mousemove);
      // lc.$().off('mouseup', mouseup);
      console.log('card-drag-control calling lc.clearMouseHandlers');
      lc.clearMouseHandlers(mousemove,mouseup);
    }

    let self = this;

    function mouseup() {
      console.log('card-drag-control:mouseDown:fn:mouseUp caught');
      lc.set('activeEventsHandler',null);
      off();
    }
    lc.setMouseHandlers(mousemove, mouseup);
    // lc.$().on('mousemove', mousemove);
    // lc.$().on('mouseup', mouseup);

    return true;
  }
});
