import { defineParameterType } from '@cucumber/cucumber';

defineParameterType({
    name: 'validation',
    regexp: /((?:is |do |does |to )?(not |to not )?(?:to )?(?:be )?(equal|strictly equal|deeply equal|have member|match|contain|above|below|greater than|less than|have type)(?:s|es)?)/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'valueWait',
    regexp: /((not )?to (?:be )?(equal|contain|above|below|match))/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'conditionWait',
    regexp: /((not )?to (?:be )?(present|clickable|visible|invisible|enabled|disabled|in viewport))/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'poType',
    regexp: /(element|collection)/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'mouseButton',
    regexp: /(left|right|middle)/,
    transformer: p => p,
    useForSnippets: false
});

defineParameterType({
    name: 'browserButton',
    regexp: /(back|forward)/,
    transformer: p => p,
    useForSnippets: false
});
