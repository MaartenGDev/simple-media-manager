import fetch from 'whatwg-fetch'
import { toArray } from './utilities/array'
import { addClassesToNode, mergeClasses, createClassSelectors } from './utilities/css'
/* global FormData */

const buildWrapper = settings => {
  let wrapper = document
    .createElement('section')

  wrapper.classList.add(settings.classes.wrapper)

  return wrapper
}

const buildHeader = settings => {
  const header = document.createElement('section')
  header.classList.add(settings.classes.header)

  const title = document.createElement('p')
  title.classList.add(settings.classes.headerTitle)

  const text = document.createTextNode(settings.names.title)

  title.appendChild(text)

  header.appendChild(title)

  return header
}

const buildActionBar = settings => {
  let uploadButton = document.createElement('input')
  uploadButton.setAttribute('type', 'file')

  uploadButton = addClassesToNode(uploadButton, settings.classes.uploadButton)
  uploadButton.appendChild(document.createTextNode('Upload'))

  let actionBar = document.createElement('section')
  actionBar = addClassesToNode(actionBar, settings.classes.actionBar)
  actionBar.appendChild(uploadButton)

  return actionBar
}

const buildResourcePreviews = settings => {
  const wrapper = document.createElement('section')
  wrapper.classList.add(settings.classes.contentWrapper)

  const resources = settings.source.paths.map(path => {
    const gridItem = document.createElement('section')
    gridItem.classList.add(settings.classes.item)
    gridItem.dataset.src = path

    gridItem.style.backgroundImage = `url('${path}')`
    gridItem.style.backgroundSize = 'contain'
    gridItem.style.backgroundRepeat = 'no-repeat'

    return gridItem
  })

  resources.forEach(x => wrapper.appendChild(x))

  return wrapper
}

const buildFooter = settings => {
  const footer = document.createElement('section')
  footer.classList.add(settings.classes.footer)

  let confirmButton = document.createElement('button')
  confirmButton = addClassesToNode(confirmButton, settings.classes.confirmButton)
  confirmButton.appendChild(document.createTextNode('Confirm'))

  let cancelButton = document.createElement('button')
  cancelButton = addClassesToNode(cancelButton, settings.classes.cancelButton)
  cancelButton.appendChild(document.createTextNode('Cancel'))

  footer.appendChild(confirmButton)
  footer.appendChild(cancelButton)

  return footer
}
const hideMediaManager = settings => {
  settings.elements.wrapper.innerHTML = ''
}
const postFileToEndpoint = (endpoint, file) => {
  return new Promise((resolve, reject) => {
    const data = new FormData()
    data.append('file', file)

    fetch(endpoint, {
      method: 'POST',
      body: data
    }).then(response => resolve(file))
      .catch(err => reject(err))
  })
}

const toggleMediaManager = settings => {
  const isShown = settings.elements.wrapper.innerHTML !== ''
  if (isShown) return hideMediaManager(settings)

  const wrapper = buildWrapper(settings)

  wrapper.appendChild(buildHeader(settings))
  wrapper.appendChild(buildActionBar(settings))
  wrapper.appendChild(buildResourcePreviews(settings))
  wrapper.appendChild(buildFooter(settings))

  settings.elements.wrapper.appendChild(wrapper)

  registerEventListenersForMediaActions(settings)
  registerEventListenersForActionBar(settings)
}
const registerEventListenersForActionBar = settings => {
  const uploadSelector = mergeClasses(createClassSelectors(toArray(settings.classes.uploadButton)))

  document.querySelector(uploadSelector).addEventListener('change', evt => {
    const file = evt.target.files[0];

    postFileToEndpoint(settings.uploadEndpoint, file)
      .then(uploadedFile => settings.events.onUploaded(uploadedFile))
  })
}

const registerEventListenersForMediaActions = settings => {
  let selectedPaths = []

  settings.elements.wrapper.addEventListener('click', evt => {
    if (evt.target.classList.contains(settings.classes.item)) {
      evt.target.classList.toggle(settings.classes.activeItem)

      const path = evt.target.dataset.src
      const isActive = evt.target.classList.contains(settings.classes.activeItem)

      if (isActive) {
        selectedPaths = [...selectedPaths, path]
      } else {
        selectedPaths = selectedPaths.filter(x => x !== path)
      }
    }
  })

  const confirmSelector = mergeClasses(createClassSelectors(toArray(settings.classes.confirmButton)))

  document.querySelector(confirmSelector).addEventListener('click', () => {
    settings.events.onConfirm(selectedPaths)
    hideMediaManager(settings)
  })
}

export const init = settings => {
  settings = Object.assign({}, {
    elements: {
      toggleElement: '',
      wrapper: ''
    },
    settings: {
      uploadEndpoint: ''
    },
    classes: {
      wrapper: 'media-manager',
      header: 'media-manager__header',
      headerTitle: 'media-manager__title',
      contentWrapper: 'media-manager__content',
      item: 'media-manager__item',
      activeItem: 'media-manager__item--active',
      footer: 'media-manager__footer',
      actionBar: 'media-manager__action-bar',
      confirmButton: ['media-manager__button', 'media-manager__button--confirm'],
      cancelButton: ['media-manager__button', 'media-manager__button--cancel'],
      uploadButton: ['media-manager__button', 'media-manager__button--upload']
    },
    names: {
      title: 'Media Manager'
    },
    events: {
      onConfirm: () => {},
      onUploaded: () => {}
    },
    source: {
      paths: []
    }
  }, settings)

  settings.elements.toggleElement.addEventListener('click', () => {
    toggleMediaManager(settings)
  })
}

export default {init}