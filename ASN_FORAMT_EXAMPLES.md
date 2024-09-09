<!-- deno-fmt-ignore-file -->
<!-- This file is generated by scripts/format-examples.ts -->

# ASN Format Examples

[Back to README](./README.md)


---

## Range 3 

Configuration (Environment Variables):

```env
ASN_PREFIX=ASN
ASN_NAMESPACE_RANGE=3
ASN_ENABLE_NAMESPACE_EXTENSION=false
```

Format Description:

```text
Configured ASN Format:
ASN  - 1    - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (ASN).
(2) Numeric Namespace, whereas
    - 1-2 is reserved for automatic generation, and
    - 3-9 is reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```


## Range 3 with ASN_ENABLE_NAMESPACE_EXTENSION

Configuration (Environment Variables):

```env
ASN_PREFIX=ASN
ASN_NAMESPACE_RANGE=3
ASN_ENABLE_NAMESPACE_EXTENSION=true
```

Format Description:

```text
Configured ASN Format:
ASN  - 1    - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (ASN).
(2) Numeric Namespace, whereas
    - 1-2 is reserved for automatic generation, and
    - 3-8,
    - 90-98,
    - 990-998,
    - 9990-9998, etc., are reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```


## Range 30 

Configuration (Environment Variables):

```env
ASN_PREFIX=ASN
ASN_NAMESPACE_RANGE=30
ASN_ENABLE_NAMESPACE_EXTENSION=false
```

Format Description:

```text
Configured ASN Format:
ASN  - 10   - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (ASN).
(2) Numeric Namespace, whereas
    - 10-29 is reserved for automatic generation, and
    - 30-99 is reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```


## Range 30 with ASN_ENABLE_NAMESPACE_EXTENSION

Configuration (Environment Variables):

```env
ASN_PREFIX=WBD
ASN_NAMESPACE_RANGE=30
ASN_ENABLE_NAMESPACE_EXTENSION=true
```

Format Description:

```text
Configured ASN Format:
WBD  - 10   - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (WBD).
(2) Numeric Namespace, whereas
    - 10-29 is reserved for automatic generation, and
    - 30-89,
    - 900-989,
    - 9900-9989,
    - 99900-99989, etc., are reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```


## Range 300 

Configuration (Environment Variables):

```env
ASN_PREFIX=WBD
ASN_NAMESPACE_RANGE=300
ASN_ENABLE_NAMESPACE_EXTENSION=false
```

Format Description:

```text
Configured ASN Format:
WBD  - 100  - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (WBD).
(2) Numeric Namespace, whereas
    - 100-299 is reserved for automatic generation, and
    - 300-999 is reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```


## Range 300 with ASN_ENABLE_NAMESPACE_EXTENSION

Configuration (Environment Variables):

```env
ASN_PREFIX=WBD
ASN_NAMESPACE_RANGE=300
ASN_ENABLE_NAMESPACE_EXTENSION=true
```

Format Description:

```text
Configured ASN Format:
WBD  - 100  - 001
(1)  - (2)  - (3)

(1) Prefix specified in configuration (WBD).
(2) Numeric Namespace, whereas
    - 100-299 is reserved for automatic generation, and
    - 300-899,
    - 9000-9899,
    - 99000-99899,
    - 999000-999899, etc., are reserved for user defined namespaces.
    The user defined namespace can be used for pre-printed ASN barcodes and the like.
(3) Counter, starting from 001, incrementing with each new ASN in the namespace.
    After 999, another digit is added.
```
