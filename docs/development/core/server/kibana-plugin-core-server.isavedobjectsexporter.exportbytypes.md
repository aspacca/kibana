<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [kibana-plugin-core-server](./kibana-plugin-core-server.md) &gt; [ISavedObjectsExporter](./kibana-plugin-core-server.isavedobjectsexporter.md) &gt; [exportByTypes](./kibana-plugin-core-server.isavedobjectsexporter.exportbytypes.md)

## ISavedObjectsExporter.exportByTypes() method

Generates an export stream for given types.

See the [options](./kibana-plugin-core-server.savedobjectsexportbytypeoptions.md) for more detailed information.

<b>Signature:</b>

```typescript
exportByTypes(options: SavedObjectsExportByTypeOptions): Promise<Readable>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  options | SavedObjectsExportByTypeOptions |  |

<b>Returns:</b>

Promise&lt;Readable&gt;

## Exceptions

SavedObjectsExportError

