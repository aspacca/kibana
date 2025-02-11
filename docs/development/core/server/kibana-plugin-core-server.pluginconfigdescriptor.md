<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-core-server](./kibana-plugin-core-server.md) &gt; [PluginConfigDescriptor](./kibana-plugin-core-server.pluginconfigdescriptor.md)

## PluginConfigDescriptor interface

Describes a plugin configuration properties.

<b>Signature:</b>

```typescript
export interface PluginConfigDescriptor<T = any> 
```

## Example


```typescript
// my_plugin/server/index.ts
import { schema, TypeOf } from '@kbn/config-schema';
import { PluginConfigDescriptor } from 'kibana/server';

const configSchema = schema.object({
  secret: schema.string({ defaultValue: 'Only on server' }),
  uiProp: schema.string({ defaultValue: 'Accessible from client' }),
});

type ConfigType = TypeOf<typeof configSchema>;

export const config: PluginConfigDescriptor<ConfigType> = {
  exposeToBrowser: {
    uiProp: true,
  },
  schema: configSchema,
  deprecations: ({ rename, unused }) => [
    rename('securityKey', 'secret'),
    unused('deprecatedProperty'),
  ],
};
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [deprecations?](./kibana-plugin-core-server.pluginconfigdescriptor.deprecations.md) | ConfigDeprecationProvider | <i>(Optional)</i> Provider for the  to apply to the plugin configuration. |
|  [exposeToBrowser?](./kibana-plugin-core-server.pluginconfigdescriptor.exposetobrowser.md) | ExposedToBrowserDescriptor&lt;T&gt; | <i>(Optional)</i> List of configuration properties that will be available on the client-side plugin. |
|  [exposeToUsage?](./kibana-plugin-core-server.pluginconfigdescriptor.exposetousage.md) | MakeUsageFromSchema&lt;T&gt; | <i>(Optional)</i> Expose non-default configs to usage collection to be sent via telemetry. set a config to <code>true</code> to report the actual changed config value. set a config to <code>false</code> to report the changed config value as \[redacted\].<!-- -->All changed configs except booleans and numbers will be reported as \[redacted\] unless otherwise specified.[MakeUsageFromSchema](./kibana-plugin-core-server.makeusagefromschema.md) |
|  [schema](./kibana-plugin-core-server.pluginconfigdescriptor.schema.md) | PluginConfigSchema&lt;T&gt; | Schema to use to validate the plugin configuration.[PluginConfigSchema](./kibana-plugin-core-server.pluginconfigschema.md) |

