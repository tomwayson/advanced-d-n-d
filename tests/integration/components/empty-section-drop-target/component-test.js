import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent('empty-section-drop-target', 'Integration | Component | empty section drop target', {
  integration: true
});

test('it renders', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });

  this.render(hbs`{{empty-section-drop-target}}`);

  assert.equal(this.$().text().trim(), '');

  // Template block usage:
  this.render(hbs`
    {{#empty-section-drop-target}}
      template block text
    {{/empty-section-drop-target}}
  `);

  assert.equal(this.$().text().trim(), 'template block text');
});
