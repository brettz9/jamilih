- Provided tentative JSON Schema

# 0.8.0
- Actual Node support
- Add document, document type, notation, entity, attribute node support
- Add ordered attribute support
- New methods on jml: toJML(), toJMLString(), toHTML() (or toDOMString()), toXML() (or toXMLDOMString()), toDOM() (an alias for jml()).
- Added unit tests

# 0.7.0
- Support appending of attributes/properties and children to existing
DOM element
- Support style as object (with hyphenated or CamelCase keys)
- Append style string attributes rather than replacing

# 0.6.0
- Breaking change to allow `on`-prefixed event handlers to become
set as direct properties rather than through `addEventListener`. If
you need the latter, use the `$on` object syntax.
- Allow decimal character references to be supplied as numbers

# 0.5.0
- Number and boolean children converted to text nodes

# 0.4.0
- Better error reporting

# 0.3.0
- Support "defaultValue" property setting