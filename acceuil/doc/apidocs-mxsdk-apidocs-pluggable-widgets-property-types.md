# Property Types | Mendix Documentation


# Property Types


## Introduction

In order to be configurable, pluggable widgets use a [widget properties definition](/apidocs-mxsdk/apidocs/pluggable-widgets/#properties-definition) which describes the properties available to pluggable widgets. To see examples of pluggable widgets in action, see [How To Build Pluggable Widgets](/howto/extensibility/pluggable-widgets/).

The common structure of a property definition is as follows:

```xml
<property key="propertyKey" type="propertyType">
    <caption>My Property</caption>
    <description>This is my property</description>
</property>
```


### XML Attributes


#### Key (required)

This defines the prop `key` in the client component props which are supplied to the widget client component. Each property must have a unique `key` which can contain letters of all cases, digits, or underscores. However, a `key` attribute cannot *start* with a digit.


#### Type (required)

This defines a property’s type. A `type` must be one of the following:

- Static Types string boolean integer decimal enumeration
- Component Types icon image widgets
- Dynamic Types expression textTemplate action attribute association object file datasource selection


### XML Elements

`<caption>` (required) â This defines the property name visible for the user (not the end-user) while configuring the widget in Studio Pro.

`<description>` (required) â This is a description which explains a property’s purpose.


## Static Types

Static types are made to pass values configured in Studio Pro to the widget. They do not depend on any dynamic data. Static properties are passed to the widget client component as simple primitive values.


### String

The string property type is represented as a simple text input in Studio Pro. It is passed as a `string` prop to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be string |
| key | Yes | String | See key |
| defaultValue | No | String | Default value for the property |
| multiline | No | Boolean | true to enable multiline input, false otherwise |
| required | No | Boolean | Whether the property must be specified by the user, true by default |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myString" type="string">
    <caption>My string</caption>
    <description>My string setting</description>
</property>
```

Then the Studio Pro UI for the property appears like this:

When the property is defined as follows:

```xml
<property key="myStringMultiline" type="string" multiline="true">
    <caption>My string multiline</caption>
    <description>My string multiline setting</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Boolean

Properties of type Boolean are represented as a toggle in Studio Pro. They are passed as `boolean` props to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be boolean |
| key | Yes | String | See key |
| defaultValue | Yes | Boolean | Default value for the property, true or false |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myBoolean" type="boolean" defaultValue="false">
    <caption>My boolean</caption>
    <description>My boolean setting</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Integer

Integer is represented as a number input in Studio Pro. It is passed as a `number` prop to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be integer |
| key | Yes | String | See key |
| defaultValue | Yes | Integer | Default value for the property |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myInteger" type="integer" defaultValue="1000">
    <caption>My integer</caption>
    <description>My integer setting</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Decimal

Properties of type decimal are represented as a number input in Studio Pro. They are passed as a `Big` prop to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be decimal |
| key | Yes | String | See key |
| defaultValue | Yes | Integer | Default value for the property |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myDecimal" type="decimal" defaultValue="50.4">
    <caption>My decimal</caption>
    <description>My decimal setting</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Enumeration

The enumeration property type allows a user to select one out of multiple options defined in the XML. The `key` of a selected enumeration element is passed as `string` prop to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be enumeration |
| key | Yes | String | See key |
| defaultValue | Yes | Integer | Default value for the property |


#### XML Elements

`<enumerationValues>` (required) â One `<enumerationValues>` element must be declared with multiple `<enumerationValue>` elements inside in order to define possible enumeration values. A `key` attribute is required for every enumeration value as well as a caption. Enter enumeration values like this:

```xml
<enumerationValue key="myEnumOption">My enum option caption</enumerationValue>
```

The `key` of a selected element will be passed to the client component. `key` should not be changed since it is used to identify options used in an app.


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myEnumeration" type="enumeration" defaultValue="blue">
    <caption>My enumeration</caption>
    <description>My enumeration setting</description>
    <enumerationValues>
        <enumerationValue key="red">Red</enumerationValue>
        <enumerationValue key="green">Green</enumerationValue>
        <enumerationValue key="blue">Blue</enumerationValue>
    </enumerationValues>
</property>
```

Then the Studio Pro UI for the property appears like this:


## Component Types


### Icon

Properties of type icon allows a user to configure an icon similar to one used by a [button](/refguide/button-properties/#icon). It is passed as `DynamicValue<IconValue>` prop to a client component. For more information, see the [IconValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#icon-value) section of *Client APIs Available to Pluggable Widgets*.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be icon |
| key | Yes | String | See key |
| required | No | Boolean | Whether the property must be specified by the user, true by default |


#### Studio Pro UI

When the component is defined as follows:

```xml
<property key="cardIcon" type="icon" required="false">
    <caption>Icon</caption>
    <description>Card icon</description>
</property>
```

Then the Studio Pro UI for the component appears like this:


### Image

Image allows a user to configure a static image from an [image collection](/refguide/image-collection/). It also allows a user to configure an image from an object that is a specialization of **System.Image**. It is passed as an `DynamicValue<ImageValue>` prop to a client component (for more information, see the [ImageValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#imagevalue) section of *Client APIs Available to Pluggable Widgets*). See the [Images Reference Guide](/refguide/images/) for more information about supported image formats.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be image |
| key | Yes | String | See key |
| required | No | Boolean | Whether the property must be specified by the user, true by default |


#### Studio Pro UI

When the component is defined as follows:

```xml
<property key="bgImage" type="image" required="false">
    <caption>Background Image</caption>
    <description>Image shown blurred in a background</description>
</property>
```

Then the Studio Pro UI for the component appears like this:


### Widgets

The widgets property allows a user to place multiple widgets inside a pluggable widget, similar to the content of a [container](/refguide/container/) widget. It is passed as a `ReactNode` prop to a client component if a `dataSource` attribute is not specified, otherwise it is passed as a [ListWidgetValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listwidgetvalue). For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be widgets |
| key | Yes | String | See key |
| dataSource | No | Property Path | Specifies the path to a datasource property linked to this widgets property |
| required | No | Boolean | Whether a user must provide at least one widget, true by default |


#### Studio Pro UI

When the component is defined without the `dataSource` attribute as follows:

```xml
<property key="content" type="widgets" required="false">
    <caption>Content</caption>
    <description>Content of a box</description>
</property>
```

then the Studio Pro UI for the component appears like this:


#### Using the DataSource Attribute

When the component is defined with the `dataSource` attribute, assuming `myDataSource` is key of a [datasource](#datasource) property defined elsewhere for this widget:

```xml
<property key="content" type="widgets" required="false" dataSource="myDataSource">
    <caption>Content</caption>
    <description>Widgets using data source</description>
</property>
```

then the Studio Pro UI for the component appears like this:


## Dynamic Types


### Expression

The expression property allows a user to configure an [expression](/refguide/expressions/).

If a `dataSource` attribute is not specified, the client will receive a `DynamicValue<T>` where `T` depends on the expression’s return type.

When a `dataSource` attribute is specified and configured by the user, it is passed as a [ListExpressionValue<T>](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listexpressionvalue) where `T` depends on the expression’s return type. For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be expression |
| key | Yes | String | See key |
| defaultValue | No | String (Expression) | Default value for the property |
| required | No | Boolean | Whether the property must be specified by the user, true by default |
| dataSource | No | Property Path | Specifies the path to a datasource property linked to this expression property |


#### XML Elements

`<returnType>` (required) â An expression property must contain a `<returnType>` element in order to define the return type of the expression. The Mendix Platform will ensure the that configured expression returns the correct data type.

The return type of the expression must be defined using either the `type` or the `assignableTo` attribute. It is not allowed to specify both.

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | No | String | A fixed return type, which must be one of the supported fixed return types |
| assignableTo | No | Property Path | Specifies the path to an attribute property which will determine the return type when configured |


##### Fixed Return Type

You can set a fixed return type for your expression property with one of the supported types from below.

| Supported Return Types | Corresponding Types Client Components Receive |
| --- | --- |
| Boolean | DynamicValue<boolean> |
| DateTime | DynamicValue<Date> |
| Decimal | DynamicValue<BigJS> |
| Integer | DynamicValue<BigJS> |
| String | DynamicValue<string> |


##### Return Type Assignable to an Attribute

You can use `assignableTo` to specify that the return type of the expression property should depend on the attribute property with the given property path. This means that the value of the expression will be assignable to the attribute configured for that attribute property (using [setValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#editable-value)).

The client component will receive a `DynamicValue<T>` where `T` depends on the possible types of the target attribute. If the attribute property allows for more than one type, the type of the actual value depends on the attribute that has been configured.

For example, when properties are defined as follows:

```xml
<property key="myAttribute" type="attribute">
    <caption>My string</caption>
    <description>My string setting</description>
    <attributeTypes>
        <attributeType name="String" />
        <attributeType name="Boolean" />
    </attributeTypes>
</property>
```

```xml
<property key="myExpression" type="expression">
    <caption>My string</caption>
    <description>My string setting</description>
    <returnType assignableTo="myAttribute" />
</property>
```

The client component will receive a `myExpression` prop of type `DynamicValue<string | boolean>`.

This is a union type of all possible value types for the expression. The actual type of the value depends on the attribute configured for the `myAttribute` property. For an attribute of type `String`, the value will be a `string`; otherwise, it will be a `boolean`.


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="progressBarColor" type="expression" defaultValue="'red'">
    <caption>Color</caption>
    <description>Progress bar CSS color</description>
    <returnType type="String" />
</property>
```

Then the Studio Pro UI for the property appears like this:


### TextTemplate

The TextTemplate property allows a user to configure a translatable text template similar to the [Caption](/refguide/text/#caption) of a text widget.

If a `dataSource` attribute is not specified, the interpolated string will be passed to the client component as `DynamicValue<string>`.

When a `dataSource` attribute is specified and configured by the user, it is passed as a [ListExpressionValue<string>](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listexpressionvalue). For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be textTemplate |
| key | Yes | String | See key |
| multiline | No | Boolean | true to enable multiline input, false otherwise |
| required | No | Boolean | Whether the property must be specified by the user, true by default |
| dataSource | No | Property Path | Specifies the path to a datasource property linked to this text template property |


#### XML Elements

`<translations>` â Allows a user to set a default value for text templates for different languages using `<translation>` elements with a `lang` attribute representing [ISO 639](https://en.wikipedia.org/wiki/ISO_639) code of the language. Available languages are listed in the [Languages Tab](/refguide/app-settings/#languages-tab) in Studio Pro.


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myBlockTitle" type="textTemplate">
    <caption>Input title</caption>
    <description>Title for the color input</description>
    <translations>
        <translation lang="en_US">Color</translation>
        <translation lang="nl_NL">Kleur</translation>
        <translation lang="uk_UA">ÐÐ¾Ð»ÑÑ</translation>
    </translations>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Action

The action property type allows a user to configure an action which can do things like call nanoflows, save changes, and open pages.

If a `dataSource` attribute is not specified, the client will receive an `ActionValue` representing the action or `undefined` if the **Do nothing** action was selected.

When a `dataSource` attribute is specified and configured by the user, it is passed as a [ListActionValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listactionvalue). For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be action |
| key | Yes | String | See key |
| dataSource | No | Property Path | Specifies path to a datasource property linked to this action property |
| defaultValue | No | String | Default value for the property, the format should be <ModuleId>.<DocumentId> |
| defaultType | No | String | Default type for the property, supported values are None, OpenPage, CallNanoflow, CallMicroflow |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="buttonAction" type="action">
    <caption>On click</caption>
    <description>Action to be performed when button is clicked</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Attribute

The attribute property type allows a widget to work directly with entities’ attributes, both reading and writing attributes. Depending on the widget’s purposes, a widget should define attribute types it supports.

If a `dataSource` attribute is not specified, the client will receive an `EditableValue<T>` where `T` depends on a configured `<attributeType>`. For more information, see the [EditableValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#editable-value) section of *Client APIs Available to Pluggable Widgets*.

When a `dataSource` attribute is specified and configured by the user, it is passed as a [ListAttributeValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listattributevalue). For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be attribute |
| key | Yes | String | See key |
| onChange | No | Property Path | The path to an action property that will be run by the Mendix Platform when the value is changed by the widget |
| required | No | Boolean | Decides if the property must be specified by the user, true by default |
| dataSource | No | Property Path | Specifies the path to a datasource property linked to this attribute property |
| setLabel | No | Boolean | true to enable setting Label value automatically with configured attribute, false otherwise |


#### XML Elements

`<attributeTypes>` (required) â This element encapsulates `<attributeType>` elements which declare supported attribute types available while configuring the attribute property in Studio Pro.

`<attributeType>` (required one or more) â this element defines the allowed attribute type in the `name` attribute.

| Supported Attribute Types | Corresponding Types Client Components Receive |
| --- | --- |
| AutoNumber | EditableValue<string> |
| Binary | EditableValue<string> |
| Boolean | EditableValue<boolean> |
| DateTime | EditableValue<Date> |
| Enum | EditableValue<string> |
| HashString | EditableValue<string> |
| Integer | EditableValue<BigJS> |
| Long | EditableValue<BigJS> |
| String | EditableValue<string> |
| Decimal | EditableValue<BigJS> |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="percentage" type="attribute" onChange="onPercentageChange">
    <caption>Percentage</caption>
    <description>Progress percentage</description>
    <attributeTypes>
        <attributeType name="Decimal"/>
        <attributeType name="Integer"/>
    </attributeTypes>
</property>

<property key="onPercentageChange" type="action">
    <caption>On change</caption>
    <description/>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Association

The association property type allows a widget to work directly with both reading and writing associations between entities. Depending on the widget’s purposes, a widget should define association types it supports.

If a `dataSource` attribute is not specified the client will receive a `ReferenceValue` for references (singular references), a `ReferenceSetValue` for reference sets (multiple references), or a union of them. For more information, see the [ModifiableValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#modifiable-value) section of *Client APIs Available to Pluggable Widgets*.

When a `dataSource` attribute is specified and configured by the user, it is passed as a [ListReferenceValue or ListReferenceSetValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listassociationvalue) depending on the configuration of the property. For more information, see the [Datasource](#datasource) section below.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be association |
| key | Yes | String | See key |
| onChange | No | Property Path | The path to an action property that will be run by the Mendix Platform when the value is changed by the widget |
| required | No | Boolean | Decides if the property must be specified by the user, true by default |
| selectableObjects | Yes | Property Path | Specifies the path to a datasource property that will provide selectable objects for the association |
| dataSource | No | Property Path | Specifies the path to a datasource property linked to this association property |
| setLabel | No | Boolean | true to enable setting Label value automatically with configured entity, false otherwise |


#### XML Elements

`<associationTypes>` (required) â This element encapsulates `<associationType>` elements which declare supported association types available while configuring the association property in Studio Pro.

`<associationType>` (required one or more) â this element defines the allowed association type in the `name` attribute.

| Supported Attribute Types | Corresponding Types Client Components Receive |
| --- | --- |
| Reference | ReferenceValue |
| ReferenceSet | ReferenceSetValue |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="ref" type="association" selectableObjects="objectsDatasource">
    <caption>Reference</caption>
    <description>Reference</description>
    <associationTypes>
        <associationType name="Reference"/>
        <associationType name="ReferenceSet"/>
    </associationTypes>
</property>

<property key="objectsDatasource" type="datasource" isList="true">
    <caption>Selectable objects</caption>
    <description/>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Object

The object property type allows to create an arbitrary list of properties.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be object |
| key | Yes | String | See key |
| isList | Yes | Boolean | Must be true |
| required | No | Boolean | This decides if the user is required to specify items in the list, true by default |


#### XML Elements

`<properties>` (required) â This encapsulates the list or properties to be configured. For more information on property groups, see the [Property Groups](/apidocs-mxsdk/apidocs/pluggable-widgets/#property-groups) section of *Pluggable Widgets API*. Properties must be grouped by `<propertyGroup>` elements. Nested object properties are not supported.


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="myObject" type="object" isList="true">
    <caption>My object list</caption>
    <description/>
    <properties>
        <propertyGroup caption="Object list group">
            <property key="myObjectBool" type="boolean" defaultValue="true">
                <caption>My boolean</caption>
                <description>My boolean setting</description>
            </property>
            <property key="myObjectAction" type="action">
                <caption>My action</caption>
                <description>My action setting</description>
            </property>
        </propertyGroup>
    </properties>
</property>
```

Then the Studio Pro UI for the property appears like this:


### File

The file property type allows a user to configure a file from an object that is a specialization of **System.File**. It is passed as a [DynamicValue<FileValue>](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#filevalue) prop to a client component.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be file |
| key | Yes | String | See key |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="file" type="file" required="false">
    <caption>File</caption>
    <description>Sample text file</description>
</property>
```

Then the Studio Pro UI for the property appears like this:


### Datasource

The datasource property allows widgets to work with object lists. The client component will receive value prop of type [ListValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis-list-values/#listvalue) and may be used with [action](#action), [attribute](#attribute), [association](#association), [expression](#expression), [text template](#texttemplate), and [widgets](#widgets) properties. See [Data Sources](/refguide/data-sources/#list-widgets) for available data source types.

If no data source has been configured by the user, any properties that are linked to the datasource property are automatically omitted from the props passed to the client component (even if they are marked as required).


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be datasource |
| key | Yes | String | See key |
| isList | Yes | Boolean | Must be true |
| required | No | Boolean | This decides if the user is required to specify a datasource, true by default |
| defaultType | No | String | Default type for the property, supported values are Database, Microflow, Nanoflow, and Association |
| defaultValue | No | String | Default value for the property, see Default Data Sources |


##### Data Source Defaults

You can use the `defaultType` and `defaultValue` attributes to configure default data sources for your widget. Unless overridden in Studio Pro, the widget will attempt to configure the data source according to its defaults. Both attributes need to be set for the defaults to be applied.

The format of `defaultValue` depends on the chosen `defaultType`:

| Data source type | Format | Example |
| --- | --- | --- |
| Database Association | Entity Path | ModuleName.EntityName or ModuleName.A/ModuleName.A_B/ModuleName.B |
| Microflow Nanoflow | Document ID | ModuleName.DocumentName |


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="data" type="datasource" isList="true" required="false">
    <caption>Data source</caption>
    <description />
</property>
```

Then the Studio Pro UI for the property appears like this:


### Selection

The selection property allows a widget to read and set a selection that can be used in actions, expressions, or a `Listen to` data source of a data view.


#### XML Attributes

| Attribute | Required | Attribute Type | Description |
| --- | --- | --- | --- |
| type | Yes | String | Must be selection |
| key | Yes | String | See key |
| dataSource | Yes | Property Path | Specifies the path to a datasource property linked to this selection property |
| defaultValue | No | String (Expression) | Default value for the property |
| onChange | No | Property Path | The path to an action property that will be run by the Mendix Platform when the selection is changed by the widget |


#### XML Elements

`<selectionTypes>` (required) â This element encapsulates `<selectionType>` elements which declare supported selection types available while configuring the selection property in Studio Pro.

`<selectionType>` (required one or more) â This element defines the selection type in the `name` attribute.

| Supported Selection Types | Corresponding Types Client Components Receive |
| --- | --- |
| None | undefined |
| Single | SelectionSingleValue |
| Multi | SelectionMultiValue |

For more information, see the [SelectionValue](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#selection-value) section of *Client APIs Available to Pluggable Widgets*.


#### Studio Pro UI

When the property is defined as follows:

```xml
<property key="selection" type="selection" dataSource="datasource">
    <caption>Selection</caption>
    <description />
    <selectionTypes>
        <selectionType name="None" />
        <selectionType name="Single" />
        <selectionType name="Multi" />
    </selectionTypes>
</property>
```

Then the Studio Pro UI for the property appears like this:


## System Properties

System properties is a way for a pluggable widget to adopt extended widget functionality provided by Mendix Platform. System properties should be defined as `<systemProperty>` elements. The only property XML attribute `<systemProperty>` requires is `key` attribute, which defines a system property’s type. The following values are allowed:

- Label
- Name
- TabIndex
- Visibility
- Editability


### Label

Label property allows a pluggable widget to have labeling functionality similar to a [core input widget](/refguide/text-box/#label). This allows a user to set a label, a label position, and a label width. If a widget has a label configured, its client component will automatically be wrapped into a correct markup.

```xml
<systemProperty key="Label"/>
```


#### setLabel

You can use `setLabel` to specify which properties can be used to set the `Label` property value.

Configuring the value of a property with the `setLabel` attribute will automatically update the value of `Label`.

Only attribute and association properties can use the `setLabel` attribute.

The `Label` value is set only if it lacks a non-default value when you set it. If a property become hidden, the `Label` value is reverted back to default. More than one property can set the label. However if multiple properties with the `setLabel` attribute are visible simultaneously, the first one updated sets the label. For example, when properties are defined as follows:

```xml
<property key="myAttribute" setLabel="true" type="attribute">
    <caption>My string</caption>
    <description>My string setting</description>
    <attributeTypes>
        <attributeType name="String" />
        <attributeType name="Boolean" />
    </attributeTypes>
</property>
<property key="myAssociation" setLabel="true" type="association" selectableObjects="objectsDatasource">
    <caption>Reference</caption>
    <description>Reference</description>
    <associationTypes>
        <associationType name="Reference"/>
        <associationType name="ReferenceSet"/>
    </associationTypes>
</property>
<property key="objectsDatasource" type="datasource" isList="true">
    <caption>Selectable objects</caption>
    <description/>
</property>
```

Then the `Label` property will be set by the first property configured.


### Name

Every widget have a name by default. This property can be used to control position of the widget name input. If this property is not specified, input will be placed in **Common** tab. A widgetâs name is also used for locating it during [automated tests](/howto/integration/selenium-support/). For that purpose in web apps, a widget name is automatically appended to a `class` prop a component receives, and in native mobile apps is passed as a separate `name` prop.

```xml
<systemProperty key="Name"/>
```


### TabIndex

The TabIndex property allows pluggable widgets to implement the **Tab index** setting similar to a [core input widget](/refguide/common-widget-properties/#tab-index). Every selectable or input-like widget should opt for this to provide a consistent developing experience and an accessible app for an end-user. A widgetâs tab index, when it is not zero, is passed to a client component in a `tabIndex` prop.

```xml
<systemProperty key="TabIndex"/>
```


### Visibility

Every pluggable widget can be [conditionally hidden](/refguide/common-widget-properties/#visibility-properties). This property can be used to control a position of the widget visibility inputs.

```xml
<systemProperty key="Visibility"/>
```


### Editability

The editability property allows a pluggable widget to have an editable configuration similar to a [core input widget](/refguide/text-box/#editability). When a widget is marked as read-only or conditionally editable with condition being false, all [editable values](/apidocs-mxsdk/apidocs/pluggable-widgets-client-apis/#editable-value) its client component receives will have `readOnly` flag.

```xml
<systemProperty key="Editability"/>
```


## Read More

- Pluggable Widgets API
- Client APIs Available to Pluggable Widgets
- Build Pluggable Widgets


## Feedback

Was this page helpful?

Glad to hear it! Thank you for your response.

Sorry to hear that. Please [tell us how we can improve]().

