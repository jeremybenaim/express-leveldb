express-leveldb
===============

Sample app using:
+ express (https://github.com/visionmedia/express)
+ leveldb (thru [node-levelup](https://github.com/rvagg/node-levelup))
+ elasticsearch (w/ [node-elastical](https://github.com/rgrove/node-elastical))
+ level-namespace (https://github.com/kesla/level-namespace)
+ level-hooks (https://github.com/dominictarr/level-hooks)

### Search engine

You need a standard setup (i.e. on port 9200) of elasticsearch on your local environment.
http://www.elasticsearch.org/guide/reference/setup/

[Elasticsearch-head](https://github.com/mobz/elasticsearch-head) might be pretty useful too to get started.

Search urls : 
```
http://localhost:3000/search/users/name=test
http://localhost:3000/search/autocomplete/users/name=t
```
would returns
```
{
count: 1,
data: [
    {
      _id: "f96f2d30-6fdb-11e2-883a-07e723a59b23",
        data: {
        name: "test"
      }
    }
  ]
}
```
