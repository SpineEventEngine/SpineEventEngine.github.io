---
build:
  render: never
---

```java
static void configureEnvironment() {
    StorageFactory rdbms = JdbcStorageFactory.newBuilder()
        .setDataSource(dataSource())
        .build();
    StorageFactory datastore = DatastoreStorageFactory.newBuilder()
        .setDatastore(datastoreService())
        .build();

    ServerEnvironment
        .when(Production.class)
        .use(datastore);
    ServerEnvironment
        .when(Tests.class)
        .use(rdbms); // use RDBMS instead of default In-Memory storage for tests.
}
```

```shell
./gradlew build deploy
```
