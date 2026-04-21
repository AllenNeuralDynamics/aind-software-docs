# Software Engineer Resources

For research software engineers, [Good Research Code](https://goodresearch.dev/) is a good primer.

## Software Design Patterns

In writing software, many recurring problems exist that cannot be solved through library encapsulation because of the problem's nuances.
In such cases, however, they can frequently be solved by leveraging one or more existing _Design Patterns_.

Design Patterns are vetted approaches to solving recurring, related problems.
They describe a way to structure and organize code.
Design patterns are expressive; they communicate intent to other contributors reading and writing code.
(This is in contrast to "[spaghetti code](https://en.wikipedia.org/wiki/Spaghetti_code).")

The following is a loose collection of software design patterns.
This list is not exhaustive.
It is intended as a starting point to approaching new problems by first investigating what patterns may be relevant. 

* Object Oriented Design Patterns
  * Creational: object instantiation
    * [Factory](https://refactoring.guru/design-patterns/factory-method)
    * [Singleton](https://refactoring.guru/design-patterns/singleton)
    * Dependency Injection (aka: passing in objects to other objects as parameters)
  * Structural: object internal and external composition
    * [Acyclic Dependency Principle](https://en.wikipedia.org/wiki/Acyclic_dependencies_principle)
    * [Model-View-Controller](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93controller)
    * [Model-View-ViewModel](https://en.wikipedia.org/wiki/Model%E2%80%93view%E2%80%93viewmodel)
    * [Separation of Concerns](https://en.wikipedia.org/wiki/Separation_of_concerns)
  * Behavioral: object interactions
    * [Observer](https://refactoring.guru/design-patterns/observer)
    * Ask for forgiveness instead of permission [EAFP](https://docs.python.org/3/glossary.html#term-EAFP) over [LBYL](https://docs.python.org/3/glossary.html#term-LBYL)
  * [SOLID Principles](https://www.geeksforgeeks.org/system-design/what-is-low-level-design-or-lld-learn-system-design/) and original paper ([PDF](https://web.archive.org/web/20150906155800/http://www.objectmentor.com/resources/articles/Principles_and_Patterns.pdf))
* Communication Patterns
  * [Adapter](https://refactoring.guru/design-patterns/adapter)
  * Request-Reply
  * Publish-Subscribe
* Database interactions
  * CRUD

## Other resources

* Refactoring Guru's [Catalog of Design Patterns](https://refactoring.guru/design-patterns/catalog)
* [Thread-Safe](https://en.wikipedia.org/wiki/Thread_safety#Implementation_approaches) Design Patterns
* [ZMQ the Guide](https://zguide.zeromq.org/)
* Geeks for Geek's intro to [Low Level Design](https://www.geeksforgeeks.org/system-design/what-is-low-level-design-or-lld-learn-system-design/)

### Other Code Review resources

- Microsoft ISE Engineering Fundamentals Playbook [Code Reviews](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/)
- Jetbrains Qodana [Python Code Review Checklist (With Examples)](https://www.jetbrains.com/pages/static-code-analysis-guide/python-code-review-checklist/)
- MIT 6.005 Software Construction [Reading 4: Code Review](https://ocw.mit.edu/ans7870/6/6.005/s16/classes/04-code-review/)
