import { get } from 'lodash'
import { isLoaded, isEmpty } from 'react-redux-firebase/lib/helpers'
import { branch, renderComponent } from 'recompose'
import LoadingSpinner from 'components/LoadingSpinner'

/**
 * Show a loading spinner when a condition is truthy. Used within
 * spinnerWhileLoading. Accepts a test function and a higher-order component.
 * @param {Function} condition - Condition function for when to show spinner
 * @returns {HigherOrderComponent}
 */
export function spinnerWhile(condition) {
  return branch(condition, renderComponent(LoadingSpinner))
}

/**
 * Show a loading spinner while props are loading . Checks
 * for undefined, null, or a value (as well as handling `auth.isLoaded` and
 * `profile.isLoaded`). **NOTE:** Meant to be used with props which are passed
 * as props from state.firebase using connect (from react-redux), which means
 * it could have unexpected results for other props
 * @param {Array} propNames - List of prop names to check loading for
 * @returns {HigherOrderComponent}
 * @example <caption>Spinner While Data Loading</caption>
 * import { compose } from 'redux'
 * import { connect } from 'react-redux'
 * import firebaseConnect from 'react-redux-firebase/lib/firebaseConnect'
 *
 * const enhance = compose(
 *   firebaseConnect(() => ['projects']),
 *   connect(({ firebase: { data: { projects } } }) => ({ projects })),
 *   spinnerWhileLoading(['projects'])
 * )
 *
 * export default enhance(SomeComponent)
 */
export function spinnerWhileLoading(propNames) {
  if (!propNames || !Array.isArray(propNames)) {
    const missingPropNamesErrMsg =
      'spinnerWhileLoading requires propNames array'
    console.error(missingPropNamesErrMsg) // eslint-disable-line no-console
    throw new Error(missingPropNamesErrMsg)
  }
  return spinnerWhile((props) =>
    propNames.some((name) => !isLoaded(get(props, name)))
  )
}

/**
 * HOC that shows a component while condition is true
 * @param {Function} condition - function which returns a boolean indicating
 * whether to render the provided component or not
 * @param {React.Component} component - React component to render if condition
 * is true
 * @returns {HigherOrderComponent}
 */
export function renderWhile(condition, component) {
  return branch(condition, renderComponent(component))
}

/**
 * HOC that shows a component while any of a list of props loaded from Firebase
 * is empty (uses react-redux-firebase's isEmpty).
 * @param {Array} propNames - List of prop names to check loading for
 * @param {React.Component} component - React component to render if prop loaded
 * from Firebase is empty
 * @returns {HigherOrderComponent}
 * @example
 * renderWhileEmpty(['todos'], () => <div>Todos Not Found</div>),
 */
export function renderWhileEmpty(propNames, component) {
  if (!propNames || !Array.isArray(propNames)) {
    const missingPropNamesErrMsg = 'renderWhileEmpty requires propNames array'
    console.error(missingPropNamesErrMsg) // eslint-disable-line no-console
    throw new Error(missingPropNamesErrMsg)
  }
  return renderWhile(
    // Any of the listed prop name correspond to empty props (supporting dot path names)
    (props) =>
      propNames.some(propNames, (name) => {
        const propValue = get(props, name)
        return (
          isLoaded(propValue) &&
          (isEmpty(propValue) ||
            (Array.isArray(propValue) && !Object.keys(propValue).length))
        )
      }),
    component
  )
}
