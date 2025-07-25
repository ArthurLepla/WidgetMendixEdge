// This file was generated by Mendix Studio Pro.
//
// WARNING: Code you write here will be lost the next time you deploy the project.

package smart.proxies;

public class Variable implements com.mendix.systemwideinterfaces.core.IEntityProxy
{
	private final com.mendix.systemwideinterfaces.core.IMendixObject variableMendixObject;

	private final com.mendix.systemwideinterfaces.core.IContext context;

	/**
	 * Internal name of this entity
	 */
	public static final java.lang.String entityName = "Smart.Variable";

	/**
	 * Enum describing members of this entity
	 */
	public enum MemberNames
	{
		IIH_Id("IIH_Id"),
		Name("Name"),
		Unit("Unit"),
		DataType("DataType"),
		Description("Description"),
		IsActive("IsActive"),
		LastSyncDate("LastSyncDate"),
		MetricType("MetricType"),
		EnergyType("EnergyType"),
		Variable_Asset("Smart.Variable_Asset");

		private final java.lang.String metaName;

		MemberNames(java.lang.String s)
		{
			metaName = s;
		}

		@java.lang.Override
		public java.lang.String toString()
		{
			return metaName;
		}
	}

	public Variable(com.mendix.systemwideinterfaces.core.IContext context)
	{
		this(context, com.mendix.core.Core.instantiate(context, entityName));
	}

	protected Variable(com.mendix.systemwideinterfaces.core.IContext context, com.mendix.systemwideinterfaces.core.IMendixObject variableMendixObject)
	{
		if (variableMendixObject == null) {
			throw new java.lang.IllegalArgumentException("The given object cannot be null.");
		}
		if (!com.mendix.core.Core.isSubClassOf(entityName, variableMendixObject.getType())) {
			throw new java.lang.IllegalArgumentException(String.format("The given object is not a %s", entityName));
		}	

		this.variableMendixObject = variableMendixObject;
		this.context = context;
	}

	/**
	 * Initialize a proxy using context (recommended). This context will be used for security checking when the get- and set-methods without context parameters are called.
	 * The get- and set-methods with context parameter should be used when for instance sudo access is necessary (IContext.createSudoClone() can be used to obtain sudo access).
	 * @param context The context to be used
	 * @param mendixObject The Mendix object for the new instance
	 * @return a new instance of this proxy class
	 */
	public static smart.proxies.Variable initialize(com.mendix.systemwideinterfaces.core.IContext context, com.mendix.systemwideinterfaces.core.IMendixObject mendixObject)
	{
		return new smart.proxies.Variable(context, mendixObject);
	}

	public static smart.proxies.Variable load(com.mendix.systemwideinterfaces.core.IContext context, com.mendix.systemwideinterfaces.core.IMendixIdentifier mendixIdentifier) throws com.mendix.core.CoreException
	{
		com.mendix.systemwideinterfaces.core.IMendixObject mendixObject = com.mendix.core.Core.retrieveId(context, mendixIdentifier);
		return smart.proxies.Variable.initialize(context, mendixObject);
	}

	public static java.util.List<smart.proxies.Variable> load(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String xpathConstraint) throws com.mendix.core.CoreException
	{
		return com.mendix.core.Core.createXPathQuery(String.format("//%1$s%2$s", entityName, xpathConstraint))
			.execute(context)
			.stream()
			.map(obj -> smart.proxies.Variable.initialize(context, obj))
			.collect(java.util.stream.Collectors.toList());
	}

	/**
	 * @return value of IIH_Id
	 */
	public final java.lang.String getIIH_Id()
	{
		return getIIH_Id(getContext());
	}

	/**
	 * @param context
	 * @return value of IIH_Id
	 */
	public final java.lang.String getIIH_Id(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.String) getMendixObject().getValue(context, MemberNames.IIH_Id.toString());
	}

	/**
	 * Set value of IIH_Id
	 * @param iih_id
	 */
	public final void setIIH_Id(java.lang.String iih_id)
	{
		setIIH_Id(getContext(), iih_id);
	}

	/**
	 * Set value of IIH_Id
	 * @param context
	 * @param iih_id
	 */
	public final void setIIH_Id(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String iih_id)
	{
		getMendixObject().setValue(context, MemberNames.IIH_Id.toString(), iih_id);
	}

	/**
	 * @return value of Name
	 */
	public final java.lang.String getName()
	{
		return getName(getContext());
	}

	/**
	 * @param context
	 * @return value of Name
	 */
	public final java.lang.String getName(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.String) getMendixObject().getValue(context, MemberNames.Name.toString());
	}

	/**
	 * Set value of Name
	 * @param name
	 */
	public final void setName(java.lang.String name)
	{
		setName(getContext(), name);
	}

	/**
	 * Set value of Name
	 * @param context
	 * @param name
	 */
	public final void setName(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String name)
	{
		getMendixObject().setValue(context, MemberNames.Name.toString(), name);
	}

	/**
	 * @return value of Unit
	 */
	public final java.lang.String getUnit()
	{
		return getUnit(getContext());
	}

	/**
	 * @param context
	 * @return value of Unit
	 */
	public final java.lang.String getUnit(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.String) getMendixObject().getValue(context, MemberNames.Unit.toString());
	}

	/**
	 * Set value of Unit
	 * @param unit
	 */
	public final void setUnit(java.lang.String unit)
	{
		setUnit(getContext(), unit);
	}

	/**
	 * Set value of Unit
	 * @param context
	 * @param unit
	 */
	public final void setUnit(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String unit)
	{
		getMendixObject().setValue(context, MemberNames.Unit.toString(), unit);
	}

	/**
	 * @return value of DataType
	 */
	public final java.lang.String getDataType()
	{
		return getDataType(getContext());
	}

	/**
	 * @param context
	 * @return value of DataType
	 */
	public final java.lang.String getDataType(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.String) getMendixObject().getValue(context, MemberNames.DataType.toString());
	}

	/**
	 * Set value of DataType
	 * @param datatype
	 */
	public final void setDataType(java.lang.String datatype)
	{
		setDataType(getContext(), datatype);
	}

	/**
	 * Set value of DataType
	 * @param context
	 * @param datatype
	 */
	public final void setDataType(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String datatype)
	{
		getMendixObject().setValue(context, MemberNames.DataType.toString(), datatype);
	}

	/**
	 * @return value of Description
	 */
	public final java.lang.String getDescription()
	{
		return getDescription(getContext());
	}

	/**
	 * @param context
	 * @return value of Description
	 */
	public final java.lang.String getDescription(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.String) getMendixObject().getValue(context, MemberNames.Description.toString());
	}

	/**
	 * Set value of Description
	 * @param description
	 */
	public final void setDescription(java.lang.String description)
	{
		setDescription(getContext(), description);
	}

	/**
	 * Set value of Description
	 * @param context
	 * @param description
	 */
	public final void setDescription(com.mendix.systemwideinterfaces.core.IContext context, java.lang.String description)
	{
		getMendixObject().setValue(context, MemberNames.Description.toString(), description);
	}

	/**
	 * @return value of IsActive
	 */
	public final java.lang.Boolean getIsActive()
	{
		return getIsActive(getContext());
	}

	/**
	 * @param context
	 * @return value of IsActive
	 */
	public final java.lang.Boolean getIsActive(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.lang.Boolean) getMendixObject().getValue(context, MemberNames.IsActive.toString());
	}

	/**
	 * Set value of IsActive
	 * @param isactive
	 */
	public final void setIsActive(java.lang.Boolean isactive)
	{
		setIsActive(getContext(), isactive);
	}

	/**
	 * Set value of IsActive
	 * @param context
	 * @param isactive
	 */
	public final void setIsActive(com.mendix.systemwideinterfaces.core.IContext context, java.lang.Boolean isactive)
	{
		getMendixObject().setValue(context, MemberNames.IsActive.toString(), isactive);
	}

	/**
	 * @return value of LastSyncDate
	 */
	public final java.util.Date getLastSyncDate()
	{
		return getLastSyncDate(getContext());
	}

	/**
	 * @param context
	 * @return value of LastSyncDate
	 */
	public final java.util.Date getLastSyncDate(com.mendix.systemwideinterfaces.core.IContext context)
	{
		return (java.util.Date) getMendixObject().getValue(context, MemberNames.LastSyncDate.toString());
	}

	/**
	 * Set value of LastSyncDate
	 * @param lastsyncdate
	 */
	public final void setLastSyncDate(java.util.Date lastsyncdate)
	{
		setLastSyncDate(getContext(), lastsyncdate);
	}

	/**
	 * Set value of LastSyncDate
	 * @param context
	 * @param lastsyncdate
	 */
	public final void setLastSyncDate(com.mendix.systemwideinterfaces.core.IContext context, java.util.Date lastsyncdate)
	{
		getMendixObject().setValue(context, MemberNames.LastSyncDate.toString(), lastsyncdate);
	}

	/**
	 * Get value of MetricType
	 * @param metrictype
	 */
	public final smart.proxies.MetricType getMetricType()
	{
		return getMetricType(getContext());
	}

	/**
	 * @param context
	 * @return value of MetricType
	 */
	public final smart.proxies.MetricType getMetricType(com.mendix.systemwideinterfaces.core.IContext context)
	{
		Object obj = getMendixObject().getValue(context, MemberNames.MetricType.toString());
		if (obj == null) {
			return null;
		}
		return smart.proxies.MetricType.valueOf((java.lang.String) obj);
	}

	/**
	 * Set value of MetricType
	 * @param metrictype
	 */
	public final void setMetricType(smart.proxies.MetricType metrictype)
	{
		setMetricType(getContext(), metrictype);
	}

	/**
	 * Set value of MetricType
	 * @param context
	 * @param metrictype
	 */
	public final void setMetricType(com.mendix.systemwideinterfaces.core.IContext context, smart.proxies.MetricType metrictype)
	{
		if (metrictype != null) {
			getMendixObject().setValue(context, MemberNames.MetricType.toString(), metrictype.toString());
		} else {
			getMendixObject().setValue(context, MemberNames.MetricType.toString(), null);
		}
	}

	/**
	 * Get value of EnergyType
	 * @param energytype
	 */
	public final smart.proxies.EnergyType getEnergyType()
	{
		return getEnergyType(getContext());
	}

	/**
	 * @param context
	 * @return value of EnergyType
	 */
	public final smart.proxies.EnergyType getEnergyType(com.mendix.systemwideinterfaces.core.IContext context)
	{
		Object obj = getMendixObject().getValue(context, MemberNames.EnergyType.toString());
		if (obj == null) {
			return null;
		}
		return smart.proxies.EnergyType.valueOf((java.lang.String) obj);
	}

	/**
	 * Set value of EnergyType
	 * @param energytype
	 */
	public final void setEnergyType(smart.proxies.EnergyType energytype)
	{
		setEnergyType(getContext(), energytype);
	}

	/**
	 * Set value of EnergyType
	 * @param context
	 * @param energytype
	 */
	public final void setEnergyType(com.mendix.systemwideinterfaces.core.IContext context, smart.proxies.EnergyType energytype)
	{
		if (energytype != null) {
			getMendixObject().setValue(context, MemberNames.EnergyType.toString(), energytype.toString());
		} else {
			getMendixObject().setValue(context, MemberNames.EnergyType.toString(), null);
		}
	}

	/**
	 * @throws com.mendix.core.CoreException
	 * @return value of Variable_Asset
	 */
	public final smart.proxies.Asset getVariable_Asset() throws com.mendix.core.CoreException
	{
		return getVariable_Asset(getContext());
	}

	/**
	 * @param context
	 * @return value of Variable_Asset
	 * @throws com.mendix.core.CoreException
	 */
	public final smart.proxies.Asset getVariable_Asset(com.mendix.systemwideinterfaces.core.IContext context) throws com.mendix.core.CoreException
	{
		smart.proxies.Asset result = null;
		com.mendix.systemwideinterfaces.core.IMendixIdentifier identifier = getMendixObject().getValue(context, MemberNames.Variable_Asset.toString());
		if (identifier != null) {
			result = smart.proxies.Asset.load(context, identifier);
		}
		return result;
	}

	/**
	 * Set value of Variable_Asset
	 * @param variable_asset
	 */
	public final void setVariable_Asset(smart.proxies.Asset variable_asset)
	{
		setVariable_Asset(getContext(), variable_asset);
	}

	/**
	 * Set value of Variable_Asset
	 * @param context
	 * @param variable_asset
	 */
	public final void setVariable_Asset(com.mendix.systemwideinterfaces.core.IContext context, smart.proxies.Asset variable_asset)
	{
		if (variable_asset == null) {
			getMendixObject().setValue(context, MemberNames.Variable_Asset.toString(), null);
		} else {
			getMendixObject().setValue(context, MemberNames.Variable_Asset.toString(), variable_asset.getMendixObject().getId());
		}
	}

	@java.lang.Override
	public final com.mendix.systemwideinterfaces.core.IMendixObject getMendixObject()
	{
		return variableMendixObject;
	}

	@java.lang.Override
	public final com.mendix.systemwideinterfaces.core.IContext getContext()
	{
		return context;
	}

	@java.lang.Override
	public boolean equals(Object obj)
	{
		if (obj == this) {
			return true;
		}
		if (obj != null && getClass().equals(obj.getClass()))
		{
			final smart.proxies.Variable that = (smart.proxies.Variable) obj;
			return getMendixObject().equals(that.getMendixObject());
		}
		return false;
	}

	@java.lang.Override
	public int hashCode()
	{
		return getMendixObject().hashCode();
	}

  /**
   * Gives full name ("Module.Entity" name) of the type of the entity.
   *
   * @return the name
   */
	public static java.lang.String getType()
	{
		return entityName;
	}
}
