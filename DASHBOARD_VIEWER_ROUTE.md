# Dashboard Viewer Route Setup

## Overview
This document provides the exact console extension configuration needed to make dashboard list links navigate to the OCPDashboardApp component.

## Console Extension to Add

Add this route to `/web/console-extensions.json` in the array:

```json
{
  "type": "console.page/route",
  "properties": {
    "exact": false,
    "path": "/monitoring/v2/dashboards/view",
    "component": { "$codeRef": "DashboardViewerPage.MpCmoDashboardViewerPage" }
  }
}
```

For virtualization perspective, also add:

```json
{
  "type": "console.page/route",
  "properties": {
    "exact": false,
    "path": "/virt-monitoring/v2/dashboards/view",
    "component": { "$codeRef": "DashboardViewerPage.MpCmoDashboardViewerPage" }
  }
}
```

## How It Works

### 1. Link Click Flow
1. User clicks dashboard name in table:
   ```jsx
   <Link to="/monitoring/v2/dashboards/view?dashboard=my-dashboard&project=my-project">
     My Dashboard
   </Link>
   ```

2. Route matches `/monitoring/v2/dashboards/view`

3. `DashboardViewerPage.MpCmoDashboardViewerPage` component loads

4. Component reads URL parameters:
   - `dashboard=my-dashboard`
   - `project=my-project`

5. Component finds matching dashboard and renders `OCPDashboardApp`

### 2. Component Structure

```
DashboardViewerPage
├── Reads URL params (dashboard, project)
├── Sets active project if needed
├── Changes dashboard if needed
├── Finds dashboard in activeProjectDashboardsMetadata
└── Renders DashboardLayout
    └── OCPDashboardApp (with exact dashboard resource)
```

### 3. Error Handling

- **Dashboard not found**: Shows error message
- **Loading state**: Shows LoadingInline component
- **No dashboards**: Shows ProjectEmptyState

### 4. Dashboard Selection Logic

```typescript
// Get parameters from URL
const urlDashboard = searchParams.get('dashboard');
const urlProject = searchParams.get('project');

// Find the specific dashboard
const currentDashboard = activeProjectDashboardsMetadata.find(
  d => d.name === urlDashboard
);

// Render OCPDashboardApp with that specific dashboard
<OCPDashboardApp
  dashboardResource={currentDashboard.persesDashboard}
  isReadonly={false}
  isVariableEnabled={true}
  isDatasourceEnabled={true}
  onSave={handleDashboardSave}
  emptyDashboardProps={{
    title: t('Empty Dashboard'),
    description: t('To get started add something to your dashboard'),
  }}
/>
```

## Testing the Route

1. **Build the plugin**: `npm run build`
2. **Add console extension** to `console-extensions.json`
3. **Navigate to**: `/monitoring/v2/dashboards` (dashboard list)
4. **Click any dashboard name** in the table
5. **Should navigate to**: `/monitoring/v2/dashboards/view?dashboard=X&project=Y`
6. **Should show**: Full OCPDashboardApp with the selected dashboard

## URL Examples

- Dashboard List: `/monitoring/v2/dashboards`
- Dashboard Viewer: `/monitoring/v2/dashboards/view?dashboard=cpu-dashboard&project=openshift-monitoring`
- Virt Dashboard: `/virt-monitoring/v2/dashboards/view?dashboard=memory-dashboard&project=my-project`

This creates a seamless navigation flow from the sortable dashboard list to the full dashboard viewer.