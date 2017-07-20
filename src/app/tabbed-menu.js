var $ = require('jquery')
var loadingSpinner = require('./loading-spinner')

module.exports = tabbedMenu

function tabbedMenu (container, appAPI, events, opts) {
  container.querySelectorAll('li').forEach(function (el) {
    el.onclick = function (ev) { selectTab(this) }
  })

  events.app.register('debuggingRequested', () => {
    selectTab(container.querySelector('li.debugView'))
  })

  // initialize tabbed menu
  selectTab(container.querySelector('.compileView'))

  // add event listeners for loading spinner
  events.compiler.register('loadingCompiler', function start () {
    var compileTab = document.querySelector('.compileView')
    if (compileTab.children.length) return

    var spinner = loadingSpinner()
    compileTab.appendChild(spinner)

    appAPI.warnCompilerLoading('Solidity compiler is currently loading. Please wait a moment...')
    events.compiler.register('compilerLoaded', finish)
    function finish () {
      events.compiler.unregister('compilerLoaded', finish)
      compileTab.removeChild(spinner)
    }
  })

  // select tab
  function selectTab (el) {
    el = $(el)
    var match = /[a-z]+View/.exec(el.get(0).className)
    if (!match) return
    var cls = match[0]
    if (!el.hasClass('active')) {
      el.parent().find('li').removeClass('active')
      $('#optionViews').attr('class', '').addClass(cls)
      el.addClass('active')
    }
    events.app.trigger('tabChanged', [cls])
  }
}
