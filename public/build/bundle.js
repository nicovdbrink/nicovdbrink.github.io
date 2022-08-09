
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop$3() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }
    class HtmlTag {
        constructor() {
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop$3,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop$3;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.47.0' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /* src/ModeSwitcher.svelte generated by Svelte v3.47.0 */
    const file$2 = "src/ModeSwitcher.svelte";

    // (25:2) {:else}
    function create_else_block(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M256 144C194.1 144 144 194.1 144 256c0 61.86 50.14 112 112 112s112-50.14 112-112C368 194.1 317.9 144 256 144zM256 320c-35.29 0-64-28.71-64-64c0-35.29 28.71-64 64-64s64 28.71 64 64C320 291.3 291.3 320 256 320zM256 112c13.25 0 24-10.75 24-24v-64C280 10.75 269.3 0 256 0S232 10.75 232 24v64C232 101.3 242.8 112 256 112zM256 400c-13.25 0-24 10.75-24 24v64C232 501.3 242.8 512 256 512s24-10.75 24-24v-64C280 410.8 269.3 400 256 400zM488 232h-64c-13.25 0-24 10.75-24 24s10.75 24 24 24h64C501.3 280 512 269.3 512 256S501.3 232 488 232zM112 256c0-13.25-10.75-24-24-24h-64C10.75 232 0 242.8 0 256s10.75 24 24 24h64C101.3 280 112 269.3 112 256zM391.8 357.8c-9.344-9.375-24.56-9.372-33.94 .0031s-9.375 24.56 0 33.93l45.25 45.28c4.672 4.688 10.83 7.031 16.97 7.031s12.28-2.344 16.97-7.031c9.375-9.375 9.375-24.56 0-33.94L391.8 357.8zM120.2 154.2c4.672 4.688 10.83 7.031 16.97 7.031S149.5 158.9 154.2 154.2c9.375-9.375 9.375-24.56 0-33.93L108.9 74.97c-9.344-9.375-24.56-9.375-33.94 0s-9.375 24.56 0 33.94L120.2 154.2zM374.8 161.2c6.141 0 12.3-2.344 16.97-7.031l45.25-45.28c9.375-9.375 9.375-24.56 0-33.94s-24.59-9.375-33.94 0l-45.25 45.28c-9.375 9.375-9.375 24.56 0 33.93C362.5 158.9 368.7 161.2 374.8 161.2zM120.2 357.8l-45.25 45.28c-9.375 9.375-9.375 24.56 0 33.94c4.688 4.688 10.83 7.031 16.97 7.031s12.3-2.344 16.97-7.031l45.25-45.28c9.375-9.375 9.375-24.56 0-33.93S129.6 348.4 120.2 357.8z");
    			add_location(path, file$2, 25, 184, 1664);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "data-prefix", "far");
    			attr_dev(svg, "data-icon", "sun");
    			attr_dev(svg, "class", "svg-inline--fa fa-sun fa-w-16");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$2, 25, 2, 1482);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(25:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (23:2) {#if darkMode}
    function create_if_block$1(ctx) {
    	let svg;
    	let path;

    	const block = {
    		c: function create() {
    			svg = svg_element("svg");
    			path = svg_element("path");
    			attr_dev(path, "fill", "currentColor");
    			attr_dev(path, "d", "M279.135 512c78.756 0 150.982-35.804 198.844-94.775 28.27-34.831-2.558-85.722-46.249-77.401-82.348 15.683-158.272-47.268-158.272-130.792 0-48.424 26.06-92.292 67.434-115.836 38.745-22.05 28.999-80.788-15.022-88.919A257.936 257.936 0 0 0 279.135 0c-141.36 0-256 114.575-256 256 0 141.36 114.576 256 256 256zm0-464c12.985 0 25.689 1.201 38.016 3.478-54.76 31.163-91.693 90.042-91.693 157.554 0 113.848 103.641 199.2 215.252 177.944C402.574 433.964 344.366 464 279.135 464c-114.875 0-208-93.125-208-208s93.125-208 208-208z");
    			add_location(path, file$2, 23, 186, 906);
    			attr_dev(svg, "aria-hidden", "true");
    			attr_dev(svg, "focusable", "false");
    			attr_dev(svg, "data-prefix", "far");
    			attr_dev(svg, "data-icon", "moon");
    			attr_dev(svg, "class", "svg-inline--fa fa-moon fa-w-16");
    			attr_dev(svg, "role", "img");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 512 512");
    			add_location(svg, file$2, 23, 2, 722);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, svg, anchor);
    			append_dev(svg, path);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(svg);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(23:2) {#if darkMode}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*darkMode*/ ctx[0]) return create_if_block$1;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if_block.c();
    			attr_dev(div, "class", "absolute top-0 right-0 w-8 h-8 p-2");
    			add_location(div, file$2, 21, 0, 632);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*toggleMode*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const THEME_KEY = 'themePreference';

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ModeSwitcher', slots, []);
    	let darkMode = false;

    	function setDarkTheme(dark) {
    		$$invalidate(0, darkMode = dark);
    		document.documentElement.classList.toggle('dark', darkMode);
    	}

    	function toggleMode() {
    		setDarkTheme(!darkMode);
    		window.localStorage.setItem(THEME_KEY, darkMode ? 'dark' : 'light');
    	}

    	onMount(() => {
    		const theme = window.localStorage.getItem(THEME_KEY);

    		if (theme === 'dark') {
    			setDarkTheme(true);
    		} else if (theme == null && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    			setDarkTheme(true);
    		}
    	});

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ModeSwitcher> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		onMount,
    		darkMode,
    		THEME_KEY,
    		setDarkTheme,
    		toggleMode
    	});

    	$$self.$inject_state = $$props => {
    		if ('darkMode' in $$props) $$invalidate(0, darkMode = $$props.darkMode);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [darkMode, toggleMode];
    }

    class ModeSwitcher extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ModeSwitcher",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/Tailwindcss.svelte generated by Svelte v3.47.0 */

    function create_fragment$3(ctx) {
    	const block = {
    		c: noop$3,
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: noop$3,
    		p: noop$3,
    		i: noop$3,
    		o: noop$3,
    		d: noop$3
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Tailwindcss', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Tailwindcss> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class Tailwindcss extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Tailwindcss",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /******************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
        return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) try {
                if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                if (y = 0, t) op = [op[0] & 2, t.value];
                switch (op[0]) {
                    case 0: case 1: t = op; break;
                    case 4: _.label++; return { value: op[1], done: false };
                    case 5: _.label++; y = op[1]; op = [0]; continue;
                    case 7: op = _.ops.pop(); _.trys.pop(); continue;
                    default:
                        if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                        if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                        if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                        if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                        if (t[2]) _.ops.pop();
                        _.trys.pop(); continue;
                }
                op = body.call(thisArg, _);
            } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
            if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
        }
    }

    function __spreadArray(to, from, pack) {
        if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
            if (ar || !(i in from)) {
                if (!ar) ar = Array.prototype.slice.call(from, 0, i);
                ar[i] = from[i];
            }
        }
        return to.concat(ar || Array.prototype.slice.call(from));
    }

    var genericMessage = "Invariant Violation";
    var _a$3 = Object.setPrototypeOf, setPrototypeOf = _a$3 === void 0 ? function (obj, proto) {
        obj.__proto__ = proto;
        return obj;
    } : _a$3;
    var InvariantError = /** @class */ (function (_super) {
        __extends(InvariantError, _super);
        function InvariantError(message) {
            if (message === void 0) { message = genericMessage; }
            var _this = _super.call(this, typeof message === "number"
                ? genericMessage + ": " + message + " (see https://github.com/apollographql/invariant-packages)"
                : message) || this;
            _this.framesToPop = 1;
            _this.name = genericMessage;
            setPrototypeOf(_this, InvariantError.prototype);
            return _this;
        }
        return InvariantError;
    }(Error));
    function invariant$1(condition, message) {
        if (!condition) {
            throw new InvariantError(message);
        }
    }
    var verbosityLevels = ["debug", "log", "warn", "error", "silent"];
    var verbosityLevel = verbosityLevels.indexOf("log");
    function wrapConsoleMethod(name) {
        return function () {
            if (verbosityLevels.indexOf(name) >= verbosityLevel) {
                // Default to console.log if this host environment happens not to provide
                // all the console.* methods we need.
                var method = console[name] || console.log;
                return method.apply(console, arguments);
            }
        };
    }
    (function (invariant) {
        invariant.debug = wrapConsoleMethod("debug");
        invariant.log = wrapConsoleMethod("log");
        invariant.warn = wrapConsoleMethod("warn");
        invariant.error = wrapConsoleMethod("error");
    })(invariant$1 || (invariant$1 = {}));

    function maybe$1(thunk) {
        try {
            return thunk();
        }
        catch (_a) { }
    }

    var global$1 = (maybe$1(function () { return globalThis; }) ||
        maybe$1(function () { return window; }) ||
        maybe$1(function () { return self; }) ||
        maybe$1(function () { return global; }) ||
        maybe$1(function () { return maybe$1.constructor("return this")(); }));

    var __ = "__";
    var GLOBAL_KEY = [__, __].join("DEV");
    function getDEV() {
        try {
            return Boolean(__DEV__);
        }
        catch (_a) {
            Object.defineProperty(global$1, GLOBAL_KEY, {
                value: maybe$1(function () { return process.env.NODE_ENV; }) !== "production",
                enumerable: false,
                configurable: true,
                writable: true,
            });
            return global$1[GLOBAL_KEY];
        }
    }
    var DEV = getDEV();

    function maybe(thunk) {
      try { return thunk() } catch (_) {}
    }

    var safeGlobal = (
      maybe(function() { return globalThis }) ||
      maybe(function() { return window }) ||
      maybe(function() { return self }) ||
      maybe(function() { return global }) ||
      // We don't expect the Function constructor ever to be invoked at runtime, as
      // long as at least one of globalThis, window, self, or global is defined, so
      // we are under no obligation to make it easy for static analysis tools to
      // detect syntactic usage of the Function constructor. If you think you can
      // improve your static analysis to detect this obfuscation, think again. This
      // is an arms race you cannot win, at least not in JavaScript.
      maybe(function() { return maybe.constructor("return this")() })
    );

    var needToRemove = false;

    function install() {
      if (safeGlobal &&
          !maybe(function() { return process.env.NODE_ENV }) &&
          !maybe(function() { return process })) {
        Object.defineProperty(safeGlobal, "process", {
          value: {
            env: {
              // This default needs to be "production" instead of "development", to
              // avoid the problem https://github.com/graphql/graphql-js/pull/2894
              // will eventually solve, once merged and released.
              NODE_ENV: "production",
            },
          },
          // Let anyone else change global.process as they see fit, but hide it from
          // Object.keys(global) enumeration.
          configurable: true,
          enumerable: false,
          writable: true,
        });
        needToRemove = true;
      }
    }

    // Call install() at least once, when this module is imported.
    install();

    function remove() {
      if (needToRemove) {
        delete safeGlobal.process;
        needToRemove = false;
      }
    }

    function devAssert(condition, message) {
      const booleanCondition = Boolean(condition);

      if (!booleanCondition) {
        throw new Error(message);
      }
    }

    /**
     * Return true if `value` is object-like. A value is object-like if it's not
     * `null` and has a `typeof` result of "object".
     */
    function isObjectLike(value) {
      return typeof value == 'object' && value !== null;
    }

    function invariant(condition, message) {
      const booleanCondition = Boolean(condition);

      if (!booleanCondition) {
        throw new Error(
          message != null ? message : 'Unexpected invariant triggered.',
        );
      }
    }

    const LineRegExp = /\r\n|[\n\r]/g;
    /**
     * Represents a location in a Source.
     */

    /**
     * Takes a Source and a UTF-8 character offset, and returns the corresponding
     * line and column as a SourceLocation.
     */
    function getLocation(source, position) {
      let lastLineStart = 0;
      let line = 1;

      for (const match of source.body.matchAll(LineRegExp)) {
        typeof match.index === 'number' || invariant(false);

        if (match.index >= position) {
          break;
        }

        lastLineStart = match.index + match[0].length;
        line += 1;
      }

      return {
        line,
        column: position + 1 - lastLineStart,
      };
    }

    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */
    function printLocation(location) {
      return printSourceLocation(
        location.source,
        getLocation(location.source, location.start),
      );
    }
    /**
     * Render a helpful description of the location in the GraphQL Source document.
     */

    function printSourceLocation(source, sourceLocation) {
      const firstLineColumnOffset = source.locationOffset.column - 1;
      const body = ''.padStart(firstLineColumnOffset) + source.body;
      const lineIndex = sourceLocation.line - 1;
      const lineOffset = source.locationOffset.line - 1;
      const lineNum = sourceLocation.line + lineOffset;
      const columnOffset = sourceLocation.line === 1 ? firstLineColumnOffset : 0;
      const columnNum = sourceLocation.column + columnOffset;
      const locationStr = `${source.name}:${lineNum}:${columnNum}\n`;
      const lines = body.split(/\r\n|[\n\r]/g);
      const locationLine = lines[lineIndex]; // Special case for minified documents

      if (locationLine.length > 120) {
        const subLineIndex = Math.floor(columnNum / 80);
        const subLineColumnNum = columnNum % 80;
        const subLines = [];

        for (let i = 0; i < locationLine.length; i += 80) {
          subLines.push(locationLine.slice(i, i + 80));
        }

        return (
          locationStr +
          printPrefixedLines([
            [`${lineNum} |`, subLines[0]],
            ...subLines.slice(1, subLineIndex + 1).map((subLine) => ['|', subLine]),
            ['|', '^'.padStart(subLineColumnNum)],
            ['|', subLines[subLineIndex + 1]],
          ])
        );
      }

      return (
        locationStr +
        printPrefixedLines([
          // Lines specified like this: ["prefix", "string"],
          [`${lineNum - 1} |`, lines[lineIndex - 1]],
          [`${lineNum} |`, locationLine],
          ['|', '^'.padStart(columnNum)],
          [`${lineNum + 1} |`, lines[lineIndex + 1]],
        ])
      );
    }

    function printPrefixedLines(lines) {
      const existingLines = lines.filter(([_, line]) => line !== undefined);
      const padLen = Math.max(...existingLines.map(([prefix]) => prefix.length));
      return existingLines
        .map(([prefix, line]) => prefix.padStart(padLen) + (line ? ' ' + line : ''))
        .join('\n');
    }

    function toNormalizedArgs(args) {
      const firstArg = args[0];

      if (firstArg == null || 'kind' in firstArg || 'length' in firstArg) {
        return {
          nodes: firstArg,
          source: args[1],
          positions: args[2],
          path: args[3],
          originalError: args[4],
          extensions: args[5],
        };
      }

      return firstArg;
    }
    /**
     * A GraphQLError describes an Error found during the parse, validate, or
     * execute phases of performing a GraphQL operation. In addition to a message
     * and stack trace, it also includes information about the locations in a
     * GraphQL document and/or execution result that correspond to the Error.
     */

    class GraphQLError extends Error {
      /**
       * An array of `{ line, column }` locations within the source GraphQL document
       * which correspond to this error.
       *
       * Errors during validation often contain multiple locations, for example to
       * point out two things with the same name. Errors during execution include a
       * single location, the field which produced the error.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array describing the JSON-path into the execution response which
       * corresponds to this error. Only included for errors during execution.
       *
       * Enumerable, and appears in the result of JSON.stringify().
       */

      /**
       * An array of GraphQL AST Nodes corresponding to this error.
       */

      /**
       * The source GraphQL document for the first location of this error.
       *
       * Note that if this Error represents more than one node, the source may not
       * represent nodes after the first node.
       */

      /**
       * An array of character offsets within the source GraphQL document
       * which correspond to this error.
       */

      /**
       * The original error thrown from a field resolver during execution.
       */

      /**
       * Extension fields to add to the formatted error.
       */

      /**
       * @deprecated Please use the `GraphQLErrorArgs` constructor overload instead.
       */
      constructor(message, ...rawArgs) {
        var _this$nodes, _nodeLocations$, _ref;

        const { nodes, source, positions, path, originalError, extensions } =
          toNormalizedArgs(rawArgs);
        super(message);
        this.name = 'GraphQLError';
        this.path = path !== null && path !== void 0 ? path : undefined;
        this.originalError =
          originalError !== null && originalError !== void 0
            ? originalError
            : undefined; // Compute list of blame nodes.

        this.nodes = undefinedIfEmpty(
          Array.isArray(nodes) ? nodes : nodes ? [nodes] : undefined,
        );
        const nodeLocations = undefinedIfEmpty(
          (_this$nodes = this.nodes) === null || _this$nodes === void 0
            ? void 0
            : _this$nodes.map((node) => node.loc).filter((loc) => loc != null),
        ); // Compute locations in the source for the given nodes/positions.

        this.source =
          source !== null && source !== void 0
            ? source
            : nodeLocations === null || nodeLocations === void 0
            ? void 0
            : (_nodeLocations$ = nodeLocations[0]) === null ||
              _nodeLocations$ === void 0
            ? void 0
            : _nodeLocations$.source;
        this.positions =
          positions !== null && positions !== void 0
            ? positions
            : nodeLocations === null || nodeLocations === void 0
            ? void 0
            : nodeLocations.map((loc) => loc.start);
        this.locations =
          positions && source
            ? positions.map((pos) => getLocation(source, pos))
            : nodeLocations === null || nodeLocations === void 0
            ? void 0
            : nodeLocations.map((loc) => getLocation(loc.source, loc.start));
        const originalExtensions = isObjectLike(
          originalError === null || originalError === void 0
            ? void 0
            : originalError.extensions,
        )
          ? originalError === null || originalError === void 0
            ? void 0
            : originalError.extensions
          : undefined;
        this.extensions =
          (_ref =
            extensions !== null && extensions !== void 0
              ? extensions
              : originalExtensions) !== null && _ref !== void 0
            ? _ref
            : Object.create(null); // Only properties prescribed by the spec should be enumerable.
        // Keep the rest as non-enumerable.

        Object.defineProperties(this, {
          message: {
            writable: true,
            enumerable: true,
          },
          name: {
            enumerable: false,
          },
          nodes: {
            enumerable: false,
          },
          source: {
            enumerable: false,
          },
          positions: {
            enumerable: false,
          },
          originalError: {
            enumerable: false,
          },
        }); // Include (non-enumerable) stack trace.

        /* c8 ignore start */
        // FIXME: https://github.com/graphql/graphql-js/issues/2317

        if (
          originalError !== null &&
          originalError !== void 0 &&
          originalError.stack
        ) {
          Object.defineProperty(this, 'stack', {
            value: originalError.stack,
            writable: true,
            configurable: true,
          });
        } else if (Error.captureStackTrace) {
          Error.captureStackTrace(this, GraphQLError);
        } else {
          Object.defineProperty(this, 'stack', {
            value: Error().stack,
            writable: true,
            configurable: true,
          });
        }
        /* c8 ignore stop */
      }

      get [Symbol.toStringTag]() {
        return 'GraphQLError';
      }

      toString() {
        let output = this.message;

        if (this.nodes) {
          for (const node of this.nodes) {
            if (node.loc) {
              output += '\n\n' + printLocation(node.loc);
            }
          }
        } else if (this.source && this.locations) {
          for (const location of this.locations) {
            output += '\n\n' + printSourceLocation(this.source, location);
          }
        }

        return output;
      }

      toJSON() {
        const formattedError = {
          message: this.message,
        };

        if (this.locations != null) {
          formattedError.locations = this.locations;
        }

        if (this.path != null) {
          formattedError.path = this.path;
        }

        if (this.extensions != null && Object.keys(this.extensions).length > 0) {
          formattedError.extensions = this.extensions;
        }

        return formattedError;
      }
    }

    function undefinedIfEmpty(array) {
      return array === undefined || array.length === 0 ? undefined : array;
    }

    /**
     * Produces a GraphQLError representing a syntax error, containing useful
     * descriptive information about the syntax error's position in the source.
     */

    function syntaxError(source, position, description) {
      return new GraphQLError(`Syntax Error: ${description}`, {
        source,
        positions: [position],
      });
    }

    /**
     * Contains a range of UTF-8 character offsets and token references that
     * identify the region of the source from which the AST derived.
     */
    class Location {
      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The Token at which this Node begins.
       */

      /**
       * The Token at which this Node ends.
       */

      /**
       * The Source document the AST represents.
       */
      constructor(startToken, endToken, source) {
        this.start = startToken.start;
        this.end = endToken.end;
        this.startToken = startToken;
        this.endToken = endToken;
        this.source = source;
      }

      get [Symbol.toStringTag]() {
        return 'Location';
      }

      toJSON() {
        return {
          start: this.start,
          end: this.end,
        };
      }
    }
    /**
     * Represents a range of characters represented by a lexical token
     * within a Source.
     */

    class Token {
      /**
       * The kind of Token.
       */

      /**
       * The character offset at which this Node begins.
       */

      /**
       * The character offset at which this Node ends.
       */

      /**
       * The 1-indexed line number on which this Token appears.
       */

      /**
       * The 1-indexed column number at which this Token begins.
       */

      /**
       * For non-punctuation tokens, represents the interpreted value of the token.
       *
       * Note: is undefined for punctuation tokens, but typed as string for
       * convenience in the parser.
       */

      /**
       * Tokens exist as nodes in a double-linked-list amongst all tokens
       * including ignored tokens. <SOF> is always the first node and <EOF>
       * the last.
       */
      constructor(kind, start, end, line, column, value) {
        this.kind = kind;
        this.start = start;
        this.end = end;
        this.line = line;
        this.column = column; // eslint-disable-next-line @typescript-eslint/no-non-null-assertion

        this.value = value;
        this.prev = null;
        this.next = null;
      }

      get [Symbol.toStringTag]() {
        return 'Token';
      }

      toJSON() {
        return {
          kind: this.kind,
          value: this.value,
          line: this.line,
          column: this.column,
        };
      }
    }
    /**
     * The list of all possible AST node types.
     */

    /**
     * @internal
     */
    const QueryDocumentKeys = {
      Name: [],
      Document: ['definitions'],
      OperationDefinition: [
        'name',
        'variableDefinitions',
        'directives',
        'selectionSet',
      ],
      VariableDefinition: ['variable', 'type', 'defaultValue', 'directives'],
      Variable: ['name'],
      SelectionSet: ['selections'],
      Field: ['alias', 'name', 'arguments', 'directives', 'selectionSet'],
      Argument: ['name', 'value'],
      FragmentSpread: ['name', 'directives'],
      InlineFragment: ['typeCondition', 'directives', 'selectionSet'],
      FragmentDefinition: [
        'name', // Note: fragment variable definitions are deprecated and will removed in v17.0.0
        'variableDefinitions',
        'typeCondition',
        'directives',
        'selectionSet',
      ],
      IntValue: [],
      FloatValue: [],
      StringValue: [],
      BooleanValue: [],
      NullValue: [],
      EnumValue: [],
      ListValue: ['values'],
      ObjectValue: ['fields'],
      ObjectField: ['name', 'value'],
      Directive: ['name', 'arguments'],
      NamedType: ['name'],
      ListType: ['type'],
      NonNullType: ['type'],
      SchemaDefinition: ['description', 'directives', 'operationTypes'],
      OperationTypeDefinition: ['type'],
      ScalarTypeDefinition: ['description', 'name', 'directives'],
      ObjectTypeDefinition: [
        'description',
        'name',
        'interfaces',
        'directives',
        'fields',
      ],
      FieldDefinition: ['description', 'name', 'arguments', 'type', 'directives'],
      InputValueDefinition: [
        'description',
        'name',
        'type',
        'defaultValue',
        'directives',
      ],
      InterfaceTypeDefinition: [
        'description',
        'name',
        'interfaces',
        'directives',
        'fields',
      ],
      UnionTypeDefinition: ['description', 'name', 'directives', 'types'],
      EnumTypeDefinition: ['description', 'name', 'directives', 'values'],
      EnumValueDefinition: ['description', 'name', 'directives'],
      InputObjectTypeDefinition: ['description', 'name', 'directives', 'fields'],
      DirectiveDefinition: ['description', 'name', 'arguments', 'locations'],
      SchemaExtension: ['directives', 'operationTypes'],
      ScalarTypeExtension: ['name', 'directives'],
      ObjectTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      InterfaceTypeExtension: ['name', 'interfaces', 'directives', 'fields'],
      UnionTypeExtension: ['name', 'directives', 'types'],
      EnumTypeExtension: ['name', 'directives', 'values'],
      InputObjectTypeExtension: ['name', 'directives', 'fields'],
    };
    const kindValues = new Set(Object.keys(QueryDocumentKeys));
    /**
     * @internal
     */

    function isNode(maybeNode) {
      const maybeKind =
        maybeNode === null || maybeNode === void 0 ? void 0 : maybeNode.kind;
      return typeof maybeKind === 'string' && kindValues.has(maybeKind);
    }
    /** Name */

    let OperationTypeNode;

    (function (OperationTypeNode) {
      OperationTypeNode['QUERY'] = 'query';
      OperationTypeNode['MUTATION'] = 'mutation';
      OperationTypeNode['SUBSCRIPTION'] = 'subscription';
    })(OperationTypeNode || (OperationTypeNode = {}));

    /**
     * The set of allowed directive location values.
     */
    let DirectiveLocation;
    /**
     * The enum type representing the directive location values.
     *
     * @deprecated Please use `DirectiveLocation`. Will be remove in v17.
     */

    (function (DirectiveLocation) {
      DirectiveLocation['QUERY'] = 'QUERY';
      DirectiveLocation['MUTATION'] = 'MUTATION';
      DirectiveLocation['SUBSCRIPTION'] = 'SUBSCRIPTION';
      DirectiveLocation['FIELD'] = 'FIELD';
      DirectiveLocation['FRAGMENT_DEFINITION'] = 'FRAGMENT_DEFINITION';
      DirectiveLocation['FRAGMENT_SPREAD'] = 'FRAGMENT_SPREAD';
      DirectiveLocation['INLINE_FRAGMENT'] = 'INLINE_FRAGMENT';
      DirectiveLocation['VARIABLE_DEFINITION'] = 'VARIABLE_DEFINITION';
      DirectiveLocation['SCHEMA'] = 'SCHEMA';
      DirectiveLocation['SCALAR'] = 'SCALAR';
      DirectiveLocation['OBJECT'] = 'OBJECT';
      DirectiveLocation['FIELD_DEFINITION'] = 'FIELD_DEFINITION';
      DirectiveLocation['ARGUMENT_DEFINITION'] = 'ARGUMENT_DEFINITION';
      DirectiveLocation['INTERFACE'] = 'INTERFACE';
      DirectiveLocation['UNION'] = 'UNION';
      DirectiveLocation['ENUM'] = 'ENUM';
      DirectiveLocation['ENUM_VALUE'] = 'ENUM_VALUE';
      DirectiveLocation['INPUT_OBJECT'] = 'INPUT_OBJECT';
      DirectiveLocation['INPUT_FIELD_DEFINITION'] = 'INPUT_FIELD_DEFINITION';
    })(DirectiveLocation || (DirectiveLocation = {}));

    /**
     * The set of allowed kind values for AST nodes.
     */
    let Kind;
    /**
     * The enum type representing the possible kind values of AST nodes.
     *
     * @deprecated Please use `Kind`. Will be remove in v17.
     */

    (function (Kind) {
      Kind['NAME'] = 'Name';
      Kind['DOCUMENT'] = 'Document';
      Kind['OPERATION_DEFINITION'] = 'OperationDefinition';
      Kind['VARIABLE_DEFINITION'] = 'VariableDefinition';
      Kind['SELECTION_SET'] = 'SelectionSet';
      Kind['FIELD'] = 'Field';
      Kind['ARGUMENT'] = 'Argument';
      Kind['FRAGMENT_SPREAD'] = 'FragmentSpread';
      Kind['INLINE_FRAGMENT'] = 'InlineFragment';
      Kind['FRAGMENT_DEFINITION'] = 'FragmentDefinition';
      Kind['VARIABLE'] = 'Variable';
      Kind['INT'] = 'IntValue';
      Kind['FLOAT'] = 'FloatValue';
      Kind['STRING'] = 'StringValue';
      Kind['BOOLEAN'] = 'BooleanValue';
      Kind['NULL'] = 'NullValue';
      Kind['ENUM'] = 'EnumValue';
      Kind['LIST'] = 'ListValue';
      Kind['OBJECT'] = 'ObjectValue';
      Kind['OBJECT_FIELD'] = 'ObjectField';
      Kind['DIRECTIVE'] = 'Directive';
      Kind['NAMED_TYPE'] = 'NamedType';
      Kind['LIST_TYPE'] = 'ListType';
      Kind['NON_NULL_TYPE'] = 'NonNullType';
      Kind['SCHEMA_DEFINITION'] = 'SchemaDefinition';
      Kind['OPERATION_TYPE_DEFINITION'] = 'OperationTypeDefinition';
      Kind['SCALAR_TYPE_DEFINITION'] = 'ScalarTypeDefinition';
      Kind['OBJECT_TYPE_DEFINITION'] = 'ObjectTypeDefinition';
      Kind['FIELD_DEFINITION'] = 'FieldDefinition';
      Kind['INPUT_VALUE_DEFINITION'] = 'InputValueDefinition';
      Kind['INTERFACE_TYPE_DEFINITION'] = 'InterfaceTypeDefinition';
      Kind['UNION_TYPE_DEFINITION'] = 'UnionTypeDefinition';
      Kind['ENUM_TYPE_DEFINITION'] = 'EnumTypeDefinition';
      Kind['ENUM_VALUE_DEFINITION'] = 'EnumValueDefinition';
      Kind['INPUT_OBJECT_TYPE_DEFINITION'] = 'InputObjectTypeDefinition';
      Kind['DIRECTIVE_DEFINITION'] = 'DirectiveDefinition';
      Kind['SCHEMA_EXTENSION'] = 'SchemaExtension';
      Kind['SCALAR_TYPE_EXTENSION'] = 'ScalarTypeExtension';
      Kind['OBJECT_TYPE_EXTENSION'] = 'ObjectTypeExtension';
      Kind['INTERFACE_TYPE_EXTENSION'] = 'InterfaceTypeExtension';
      Kind['UNION_TYPE_EXTENSION'] = 'UnionTypeExtension';
      Kind['ENUM_TYPE_EXTENSION'] = 'EnumTypeExtension';
      Kind['INPUT_OBJECT_TYPE_EXTENSION'] = 'InputObjectTypeExtension';
    })(Kind || (Kind = {}));

    /**
     * ```
     * WhiteSpace ::
     *   - "Horizontal Tab (U+0009)"
     *   - "Space (U+0020)"
     * ```
     * @internal
     */
    function isWhiteSpace(code) {
      return code === 0x0009 || code === 0x0020;
    }
    /**
     * ```
     * Digit :: one of
     *   - `0` `1` `2` `3` `4` `5` `6` `7` `8` `9`
     * ```
     * @internal
     */

    function isDigit(code) {
      return code >= 0x0030 && code <= 0x0039;
    }
    /**
     * ```
     * Letter :: one of
     *   - `A` `B` `C` `D` `E` `F` `G` `H` `I` `J` `K` `L` `M`
     *   - `N` `O` `P` `Q` `R` `S` `T` `U` `V` `W` `X` `Y` `Z`
     *   - `a` `b` `c` `d` `e` `f` `g` `h` `i` `j` `k` `l` `m`
     *   - `n` `o` `p` `q` `r` `s` `t` `u` `v` `w` `x` `y` `z`
     * ```
     * @internal
     */

    function isLetter(code) {
      return (
        (code >= 0x0061 && code <= 0x007a) || // A-Z
        (code >= 0x0041 && code <= 0x005a) // a-z
      );
    }
    /**
     * ```
     * NameStart ::
     *   - Letter
     *   - `_`
     * ```
     * @internal
     */

    function isNameStart(code) {
      return isLetter(code) || code === 0x005f;
    }
    /**
     * ```
     * NameContinue ::
     *   - Letter
     *   - Digit
     *   - `_`
     * ```
     * @internal
     */

    function isNameContinue(code) {
      return isLetter(code) || isDigit(code) || code === 0x005f;
    }

    /**
     * Produces the value of a block string from its parsed raw value, similar to
     * CoffeeScript's block string, Python's docstring trim or Ruby's strip_heredoc.
     *
     * This implements the GraphQL spec's BlockStringValue() static algorithm.
     *
     * @internal
     */

    function dedentBlockStringLines(lines) {
      var _firstNonEmptyLine2;

      let commonIndent = Number.MAX_SAFE_INTEGER;
      let firstNonEmptyLine = null;
      let lastNonEmptyLine = -1;

      for (let i = 0; i < lines.length; ++i) {
        var _firstNonEmptyLine;

        const line = lines[i];
        const indent = leadingWhitespace(line);

        if (indent === line.length) {
          continue; // skip empty lines
        }

        firstNonEmptyLine =
          (_firstNonEmptyLine = firstNonEmptyLine) !== null &&
          _firstNonEmptyLine !== void 0
            ? _firstNonEmptyLine
            : i;
        lastNonEmptyLine = i;

        if (i !== 0 && indent < commonIndent) {
          commonIndent = indent;
        }
      }

      return lines // Remove common indentation from all lines but first.
        .map((line, i) => (i === 0 ? line : line.slice(commonIndent))) // Remove leading and trailing blank lines.
        .slice(
          (_firstNonEmptyLine2 = firstNonEmptyLine) !== null &&
            _firstNonEmptyLine2 !== void 0
            ? _firstNonEmptyLine2
            : 0,
          lastNonEmptyLine + 1,
        );
    }

    function leadingWhitespace(str) {
      let i = 0;

      while (i < str.length && isWhiteSpace(str.charCodeAt(i))) {
        ++i;
      }

      return i;
    }
    /**
     * Print a block string in the indented block form by adding a leading and
     * trailing blank line. However, if a block string starts with whitespace and is
     * a single-line, adding a leading blank line would strip that whitespace.
     *
     * @internal
     */

    function printBlockString(value, options) {
      const escapedValue = value.replace(/"""/g, '\\"""'); // Expand a block string's raw value into independent lines.

      const lines = escapedValue.split(/\r\n|[\n\r]/g);
      const isSingleLine = lines.length === 1; // If common indentation is found we can fix some of those cases by adding leading new line

      const forceLeadingNewLine =
        lines.length > 1 &&
        lines
          .slice(1)
          .every((line) => line.length === 0 || isWhiteSpace(line.charCodeAt(0))); // Trailing triple quotes just looks confusing but doesn't force trailing new line

      const hasTrailingTripleQuotes = escapedValue.endsWith('\\"""'); // Trailing quote (single or double) or slash forces trailing new line

      const hasTrailingQuote = value.endsWith('"') && !hasTrailingTripleQuotes;
      const hasTrailingSlash = value.endsWith('\\');
      const forceTrailingNewline = hasTrailingQuote || hasTrailingSlash;
      const printAsMultipleLines =
        !(options !== null && options !== void 0 && options.minimize) && // add leading and trailing new lines only if it improves readability
        (!isSingleLine ||
          value.length > 70 ||
          forceTrailingNewline ||
          forceLeadingNewLine ||
          hasTrailingTripleQuotes);
      let result = ''; // Format a multi-line block quote to account for leading space.

      const skipLeadingNewLine = isSingleLine && isWhiteSpace(value.charCodeAt(0));

      if ((printAsMultipleLines && !skipLeadingNewLine) || forceLeadingNewLine) {
        result += '\n';
      }

      result += escapedValue;

      if (printAsMultipleLines || forceTrailingNewline) {
        result += '\n';
      }

      return '"""' + result + '"""';
    }

    /**
     * An exported enum describing the different kinds of tokens that the
     * lexer emits.
     */
    let TokenKind;
    /**
     * The enum type representing the token kinds values.
     *
     * @deprecated Please use `TokenKind`. Will be remove in v17.
     */

    (function (TokenKind) {
      TokenKind['SOF'] = '<SOF>';
      TokenKind['EOF'] = '<EOF>';
      TokenKind['BANG'] = '!';
      TokenKind['DOLLAR'] = '$';
      TokenKind['AMP'] = '&';
      TokenKind['PAREN_L'] = '(';
      TokenKind['PAREN_R'] = ')';
      TokenKind['SPREAD'] = '...';
      TokenKind['COLON'] = ':';
      TokenKind['EQUALS'] = '=';
      TokenKind['AT'] = '@';
      TokenKind['BRACKET_L'] = '[';
      TokenKind['BRACKET_R'] = ']';
      TokenKind['BRACE_L'] = '{';
      TokenKind['PIPE'] = '|';
      TokenKind['BRACE_R'] = '}';
      TokenKind['NAME'] = 'Name';
      TokenKind['INT'] = 'Int';
      TokenKind['FLOAT'] = 'Float';
      TokenKind['STRING'] = 'String';
      TokenKind['BLOCK_STRING'] = 'BlockString';
      TokenKind['COMMENT'] = 'Comment';
    })(TokenKind || (TokenKind = {}));

    /**
     * Given a Source object, creates a Lexer for that source.
     * A Lexer is a stateful stream generator in that every time
     * it is advanced, it returns the next token in the Source. Assuming the
     * source lexes, the final Token emitted by the lexer will be of kind
     * EOF, after which the lexer will repeatedly return the same EOF token
     * whenever called.
     */

    class Lexer {
      /**
       * The previously focused non-ignored token.
       */

      /**
       * The currently focused non-ignored token.
       */

      /**
       * The (1-indexed) line containing the current token.
       */

      /**
       * The character offset at which the current line begins.
       */
      constructor(source) {
        const startOfFileToken = new Token(TokenKind.SOF, 0, 0, 0, 0);
        this.source = source;
        this.lastToken = startOfFileToken;
        this.token = startOfFileToken;
        this.line = 1;
        this.lineStart = 0;
      }

      get [Symbol.toStringTag]() {
        return 'Lexer';
      }
      /**
       * Advances the token stream to the next non-ignored token.
       */

      advance() {
        this.lastToken = this.token;
        const token = (this.token = this.lookahead());
        return token;
      }
      /**
       * Looks ahead and returns the next non-ignored token, but does not change
       * the state of Lexer.
       */

      lookahead() {
        let token = this.token;

        if (token.kind !== TokenKind.EOF) {
          do {
            if (token.next) {
              token = token.next;
            } else {
              // Read the next token and form a link in the token linked-list.
              const nextToken = readNextToken(this, token.end); // @ts-expect-error next is only mutable during parsing.

              token.next = nextToken; // @ts-expect-error prev is only mutable during parsing.

              nextToken.prev = token;
              token = nextToken;
            }
          } while (token.kind === TokenKind.COMMENT);
        }

        return token;
      }
    }
    /**
     * @internal
     */

    function isPunctuatorTokenKind(kind) {
      return (
        kind === TokenKind.BANG ||
        kind === TokenKind.DOLLAR ||
        kind === TokenKind.AMP ||
        kind === TokenKind.PAREN_L ||
        kind === TokenKind.PAREN_R ||
        kind === TokenKind.SPREAD ||
        kind === TokenKind.COLON ||
        kind === TokenKind.EQUALS ||
        kind === TokenKind.AT ||
        kind === TokenKind.BRACKET_L ||
        kind === TokenKind.BRACKET_R ||
        kind === TokenKind.BRACE_L ||
        kind === TokenKind.PIPE ||
        kind === TokenKind.BRACE_R
      );
    }
    /**
     * A Unicode scalar value is any Unicode code point except surrogate code
     * points. In other words, the inclusive ranges of values 0x0000 to 0xD7FF and
     * 0xE000 to 0x10FFFF.
     *
     * SourceCharacter ::
     *   - "Any Unicode scalar value"
     */

    function isUnicodeScalarValue(code) {
      return (
        (code >= 0x0000 && code <= 0xd7ff) || (code >= 0xe000 && code <= 0x10ffff)
      );
    }
    /**
     * The GraphQL specification defines source text as a sequence of unicode scalar
     * values (which Unicode defines to exclude surrogate code points). However
     * JavaScript defines strings as a sequence of UTF-16 code units which may
     * include surrogates. A surrogate pair is a valid source character as it
     * encodes a supplementary code point (above U+FFFF), but unpaired surrogate
     * code points are not valid source characters.
     */

    function isSupplementaryCodePoint(body, location) {
      return (
        isLeadingSurrogate(body.charCodeAt(location)) &&
        isTrailingSurrogate(body.charCodeAt(location + 1))
      );
    }

    function isLeadingSurrogate(code) {
      return code >= 0xd800 && code <= 0xdbff;
    }

    function isTrailingSurrogate(code) {
      return code >= 0xdc00 && code <= 0xdfff;
    }
    /**
     * Prints the code point (or end of file reference) at a given location in a
     * source for use in error messages.
     *
     * Printable ASCII is printed quoted, while other points are printed in Unicode
     * code point form (ie. U+1234).
     */

    function printCodePointAt(lexer, location) {
      const code = lexer.source.body.codePointAt(location);

      if (code === undefined) {
        return TokenKind.EOF;
      } else if (code >= 0x0020 && code <= 0x007e) {
        // Printable ASCII
        const char = String.fromCodePoint(code);
        return char === '"' ? "'\"'" : `"${char}"`;
      } // Unicode code point

      return 'U+' + code.toString(16).toUpperCase().padStart(4, '0');
    }
    /**
     * Create a token with line and column location information.
     */

    function createToken(lexer, kind, start, end, value) {
      const line = lexer.line;
      const col = 1 + start - lexer.lineStart;
      return new Token(kind, start, end, line, col, value);
    }
    /**
     * Gets the next token from the source starting at the given position.
     *
     * This skips over whitespace until it finds the next lexable token, then lexes
     * punctuators immediately or calls the appropriate helper function for more
     * complicated tokens.
     */

    function readNextToken(lexer, start) {
      const body = lexer.source.body;
      const bodyLength = body.length;
      let position = start;

      while (position < bodyLength) {
        const code = body.charCodeAt(position); // SourceCharacter

        switch (code) {
          // Ignored ::
          //   - UnicodeBOM
          //   - WhiteSpace
          //   - LineTerminator
          //   - Comment
          //   - Comma
          //
          // UnicodeBOM :: "Byte Order Mark (U+FEFF)"
          //
          // WhiteSpace ::
          //   - "Horizontal Tab (U+0009)"
          //   - "Space (U+0020)"
          //
          // Comma :: ,
          case 0xfeff: // <BOM>

          case 0x0009: // \t

          case 0x0020: // <space>

          case 0x002c:
            // ,
            ++position;
            continue;
          // LineTerminator ::
          //   - "New Line (U+000A)"
          //   - "Carriage Return (U+000D)" [lookahead != "New Line (U+000A)"]
          //   - "Carriage Return (U+000D)" "New Line (U+000A)"

          case 0x000a:
            // \n
            ++position;
            ++lexer.line;
            lexer.lineStart = position;
            continue;

          case 0x000d:
            // \r
            if (body.charCodeAt(position + 1) === 0x000a) {
              position += 2;
            } else {
              ++position;
            }

            ++lexer.line;
            lexer.lineStart = position;
            continue;
          // Comment

          case 0x0023:
            // #
            return readComment(lexer, position);
          // Token ::
          //   - Punctuator
          //   - Name
          //   - IntValue
          //   - FloatValue
          //   - StringValue
          //
          // Punctuator :: one of ! $ & ( ) ... : = @ [ ] { | }

          case 0x0021:
            // !
            return createToken(lexer, TokenKind.BANG, position, position + 1);

          case 0x0024:
            // $
            return createToken(lexer, TokenKind.DOLLAR, position, position + 1);

          case 0x0026:
            // &
            return createToken(lexer, TokenKind.AMP, position, position + 1);

          case 0x0028:
            // (
            return createToken(lexer, TokenKind.PAREN_L, position, position + 1);

          case 0x0029:
            // )
            return createToken(lexer, TokenKind.PAREN_R, position, position + 1);

          case 0x002e:
            // .
            if (
              body.charCodeAt(position + 1) === 0x002e &&
              body.charCodeAt(position + 2) === 0x002e
            ) {
              return createToken(lexer, TokenKind.SPREAD, position, position + 3);
            }

            break;

          case 0x003a:
            // :
            return createToken(lexer, TokenKind.COLON, position, position + 1);

          case 0x003d:
            // =
            return createToken(lexer, TokenKind.EQUALS, position, position + 1);

          case 0x0040:
            // @
            return createToken(lexer, TokenKind.AT, position, position + 1);

          case 0x005b:
            // [
            return createToken(lexer, TokenKind.BRACKET_L, position, position + 1);

          case 0x005d:
            // ]
            return createToken(lexer, TokenKind.BRACKET_R, position, position + 1);

          case 0x007b:
            // {
            return createToken(lexer, TokenKind.BRACE_L, position, position + 1);

          case 0x007c:
            // |
            return createToken(lexer, TokenKind.PIPE, position, position + 1);

          case 0x007d:
            // }
            return createToken(lexer, TokenKind.BRACE_R, position, position + 1);
          // StringValue

          case 0x0022:
            // "
            if (
              body.charCodeAt(position + 1) === 0x0022 &&
              body.charCodeAt(position + 2) === 0x0022
            ) {
              return readBlockString(lexer, position);
            }

            return readString(lexer, position);
        } // IntValue | FloatValue (Digit | -)

        if (isDigit(code) || code === 0x002d) {
          return readNumber(lexer, position, code);
        } // Name

        if (isNameStart(code)) {
          return readName(lexer, position);
        }

        throw syntaxError(
          lexer.source,
          position,
          code === 0x0027
            ? 'Unexpected single quote character (\'), did you mean to use a double quote (")?'
            : isUnicodeScalarValue(code) || isSupplementaryCodePoint(body, position)
            ? `Unexpected character: ${printCodePointAt(lexer, position)}.`
            : `Invalid character: ${printCodePointAt(lexer, position)}.`,
        );
      }

      return createToken(lexer, TokenKind.EOF, bodyLength, bodyLength);
    }
    /**
     * Reads a comment token from the source file.
     *
     * ```
     * Comment :: # CommentChar* [lookahead != CommentChar]
     *
     * CommentChar :: SourceCharacter but not LineTerminator
     * ```
     */

    function readComment(lexer, start) {
      const body = lexer.source.body;
      const bodyLength = body.length;
      let position = start + 1;

      while (position < bodyLength) {
        const code = body.charCodeAt(position); // LineTerminator (\n | \r)

        if (code === 0x000a || code === 0x000d) {
          break;
        } // SourceCharacter

        if (isUnicodeScalarValue(code)) {
          ++position;
        } else if (isSupplementaryCodePoint(body, position)) {
          position += 2;
        } else {
          break;
        }
      }

      return createToken(
        lexer,
        TokenKind.COMMENT,
        start,
        position,
        body.slice(start + 1, position),
      );
    }
    /**
     * Reads a number token from the source file, either a FloatValue or an IntValue
     * depending on whether a FractionalPart or ExponentPart is encountered.
     *
     * ```
     * IntValue :: IntegerPart [lookahead != {Digit, `.`, NameStart}]
     *
     * IntegerPart ::
     *   - NegativeSign? 0
     *   - NegativeSign? NonZeroDigit Digit*
     *
     * NegativeSign :: -
     *
     * NonZeroDigit :: Digit but not `0`
     *
     * FloatValue ::
     *   - IntegerPart FractionalPart ExponentPart [lookahead != {Digit, `.`, NameStart}]
     *   - IntegerPart FractionalPart [lookahead != {Digit, `.`, NameStart}]
     *   - IntegerPart ExponentPart [lookahead != {Digit, `.`, NameStart}]
     *
     * FractionalPart :: . Digit+
     *
     * ExponentPart :: ExponentIndicator Sign? Digit+
     *
     * ExponentIndicator :: one of `e` `E`
     *
     * Sign :: one of + -
     * ```
     */

    function readNumber(lexer, start, firstCode) {
      const body = lexer.source.body;
      let position = start;
      let code = firstCode;
      let isFloat = false; // NegativeSign (-)

      if (code === 0x002d) {
        code = body.charCodeAt(++position);
      } // Zero (0)

      if (code === 0x0030) {
        code = body.charCodeAt(++position);

        if (isDigit(code)) {
          throw syntaxError(
            lexer.source,
            position,
            `Invalid number, unexpected digit after 0: ${printCodePointAt(
          lexer,
          position,
        )}.`,
          );
        }
      } else {
        position = readDigits(lexer, position, code);
        code = body.charCodeAt(position);
      } // Full stop (.)

      if (code === 0x002e) {
        isFloat = true;
        code = body.charCodeAt(++position);
        position = readDigits(lexer, position, code);
        code = body.charCodeAt(position);
      } // E e

      if (code === 0x0045 || code === 0x0065) {
        isFloat = true;
        code = body.charCodeAt(++position); // + -

        if (code === 0x002b || code === 0x002d) {
          code = body.charCodeAt(++position);
        }

        position = readDigits(lexer, position, code);
        code = body.charCodeAt(position);
      } // Numbers cannot be followed by . or NameStart

      if (code === 0x002e || isNameStart(code)) {
        throw syntaxError(
          lexer.source,
          position,
          `Invalid number, expected digit but got: ${printCodePointAt(
        lexer,
        position,
      )}.`,
        );
      }

      return createToken(
        lexer,
        isFloat ? TokenKind.FLOAT : TokenKind.INT,
        start,
        position,
        body.slice(start, position),
      );
    }
    /**
     * Returns the new position in the source after reading one or more digits.
     */

    function readDigits(lexer, start, firstCode) {
      if (!isDigit(firstCode)) {
        throw syntaxError(
          lexer.source,
          start,
          `Invalid number, expected digit but got: ${printCodePointAt(
        lexer,
        start,
      )}.`,
        );
      }

      const body = lexer.source.body;
      let position = start + 1; // +1 to skip first firstCode

      while (isDigit(body.charCodeAt(position))) {
        ++position;
      }

      return position;
    }
    /**
     * Reads a single-quote string token from the source file.
     *
     * ```
     * StringValue ::
     *   - `""` [lookahead != `"`]
     *   - `"` StringCharacter+ `"`
     *
     * StringCharacter ::
     *   - SourceCharacter but not `"` or `\` or LineTerminator
     *   - `\u` EscapedUnicode
     *   - `\` EscapedCharacter
     *
     * EscapedUnicode ::
     *   - `{` HexDigit+ `}`
     *   - HexDigit HexDigit HexDigit HexDigit
     *
     * EscapedCharacter :: one of `"` `\` `/` `b` `f` `n` `r` `t`
     * ```
     */

    function readString(lexer, start) {
      const body = lexer.source.body;
      const bodyLength = body.length;
      let position = start + 1;
      let chunkStart = position;
      let value = '';

      while (position < bodyLength) {
        const code = body.charCodeAt(position); // Closing Quote (")

        if (code === 0x0022) {
          value += body.slice(chunkStart, position);
          return createToken(lexer, TokenKind.STRING, start, position + 1, value);
        } // Escape Sequence (\)

        if (code === 0x005c) {
          value += body.slice(chunkStart, position);
          const escape =
            body.charCodeAt(position + 1) === 0x0075 // u
              ? body.charCodeAt(position + 2) === 0x007b // {
                ? readEscapedUnicodeVariableWidth(lexer, position)
                : readEscapedUnicodeFixedWidth(lexer, position)
              : readEscapedCharacter(lexer, position);
          value += escape.value;
          position += escape.size;
          chunkStart = position;
          continue;
        } // LineTerminator (\n | \r)

        if (code === 0x000a || code === 0x000d) {
          break;
        } // SourceCharacter

        if (isUnicodeScalarValue(code)) {
          ++position;
        } else if (isSupplementaryCodePoint(body, position)) {
          position += 2;
        } else {
          throw syntaxError(
            lexer.source,
            position,
            `Invalid character within String: ${printCodePointAt(
          lexer,
          position,
        )}.`,
          );
        }
      }

      throw syntaxError(lexer.source, position, 'Unterminated string.');
    } // The string value and lexed size of an escape sequence.

    function readEscapedUnicodeVariableWidth(lexer, position) {
      const body = lexer.source.body;
      let point = 0;
      let size = 3; // Cannot be larger than 12 chars (\u{00000000}).

      while (size < 12) {
        const code = body.charCodeAt(position + size++); // Closing Brace (})

        if (code === 0x007d) {
          // Must be at least 5 chars (\u{0}) and encode a Unicode scalar value.
          if (size < 5 || !isUnicodeScalarValue(point)) {
            break;
          }

          return {
            value: String.fromCodePoint(point),
            size,
          };
        } // Append this hex digit to the code point.

        point = (point << 4) | readHexDigit(code);

        if (point < 0) {
          break;
        }
      }

      throw syntaxError(
        lexer.source,
        position,
        `Invalid Unicode escape sequence: "${body.slice(
      position,
      position + size,
    )}".`,
      );
    }

    function readEscapedUnicodeFixedWidth(lexer, position) {
      const body = lexer.source.body;
      const code = read16BitHexCode(body, position + 2);

      if (isUnicodeScalarValue(code)) {
        return {
          value: String.fromCodePoint(code),
          size: 6,
        };
      } // GraphQL allows JSON-style surrogate pair escape sequences, but only when
      // a valid pair is formed.

      if (isLeadingSurrogate(code)) {
        // \u
        if (
          body.charCodeAt(position + 6) === 0x005c &&
          body.charCodeAt(position + 7) === 0x0075
        ) {
          const trailingCode = read16BitHexCode(body, position + 8);

          if (isTrailingSurrogate(trailingCode)) {
            // JavaScript defines strings as a sequence of UTF-16 code units and
            // encodes Unicode code points above U+FFFF using a surrogate pair of
            // code units. Since this is a surrogate pair escape sequence, just
            // include both codes into the JavaScript string value. Had JavaScript
            // not been internally based on UTF-16, then this surrogate pair would
            // be decoded to retrieve the supplementary code point.
            return {
              value: String.fromCodePoint(code, trailingCode),
              size: 12,
            };
          }
        }
      }

      throw syntaxError(
        lexer.source,
        position,
        `Invalid Unicode escape sequence: "${body.slice(position, position + 6)}".`,
      );
    }
    /**
     * Reads four hexadecimal characters and returns the positive integer that 16bit
     * hexadecimal string represents. For example, "000f" will return 15, and "dead"
     * will return 57005.
     *
     * Returns a negative number if any char was not a valid hexadecimal digit.
     */

    function read16BitHexCode(body, position) {
      // readHexDigit() returns -1 on error. ORing a negative value with any other
      // value always produces a negative value.
      return (
        (readHexDigit(body.charCodeAt(position)) << 12) |
        (readHexDigit(body.charCodeAt(position + 1)) << 8) |
        (readHexDigit(body.charCodeAt(position + 2)) << 4) |
        readHexDigit(body.charCodeAt(position + 3))
      );
    }
    /**
     * Reads a hexadecimal character and returns its positive integer value (0-15).
     *
     * '0' becomes 0, '9' becomes 9
     * 'A' becomes 10, 'F' becomes 15
     * 'a' becomes 10, 'f' becomes 15
     *
     * Returns -1 if the provided character code was not a valid hexadecimal digit.
     *
     * HexDigit :: one of
     *   - `0` `1` `2` `3` `4` `5` `6` `7` `8` `9`
     *   - `A` `B` `C` `D` `E` `F`
     *   - `a` `b` `c` `d` `e` `f`
     */

    function readHexDigit(code) {
      return code >= 0x0030 && code <= 0x0039 // 0-9
        ? code - 0x0030
        : code >= 0x0041 && code <= 0x0046 // A-F
        ? code - 0x0037
        : code >= 0x0061 && code <= 0x0066 // a-f
        ? code - 0x0057
        : -1;
    }
    /**
     * | Escaped Character | Code Point | Character Name               |
     * | ----------------- | ---------- | ---------------------------- |
     * | `"`               | U+0022     | double quote                 |
     * | `\`               | U+005C     | reverse solidus (back slash) |
     * | `/`               | U+002F     | solidus (forward slash)      |
     * | `b`               | U+0008     | backspace                    |
     * | `f`               | U+000C     | form feed                    |
     * | `n`               | U+000A     | line feed (new line)         |
     * | `r`               | U+000D     | carriage return              |
     * | `t`               | U+0009     | horizontal tab               |
     */

    function readEscapedCharacter(lexer, position) {
      const body = lexer.source.body;
      const code = body.charCodeAt(position + 1);

      switch (code) {
        case 0x0022:
          // "
          return {
            value: '\u0022',
            size: 2,
          };

        case 0x005c:
          // \
          return {
            value: '\u005c',
            size: 2,
          };

        case 0x002f:
          // /
          return {
            value: '\u002f',
            size: 2,
          };

        case 0x0062:
          // b
          return {
            value: '\u0008',
            size: 2,
          };

        case 0x0066:
          // f
          return {
            value: '\u000c',
            size: 2,
          };

        case 0x006e:
          // n
          return {
            value: '\u000a',
            size: 2,
          };

        case 0x0072:
          // r
          return {
            value: '\u000d',
            size: 2,
          };

        case 0x0074:
          // t
          return {
            value: '\u0009',
            size: 2,
          };
      }

      throw syntaxError(
        lexer.source,
        position,
        `Invalid character escape sequence: "${body.slice(
      position,
      position + 2,
    )}".`,
      );
    }
    /**
     * Reads a block string token from the source file.
     *
     * ```
     * StringValue ::
     *   - `"""` BlockStringCharacter* `"""`
     *
     * BlockStringCharacter ::
     *   - SourceCharacter but not `"""` or `\"""`
     *   - `\"""`
     * ```
     */

    function readBlockString(lexer, start) {
      const body = lexer.source.body;
      const bodyLength = body.length;
      let lineStart = lexer.lineStart;
      let position = start + 3;
      let chunkStart = position;
      let currentLine = '';
      const blockLines = [];

      while (position < bodyLength) {
        const code = body.charCodeAt(position); // Closing Triple-Quote (""")

        if (
          code === 0x0022 &&
          body.charCodeAt(position + 1) === 0x0022 &&
          body.charCodeAt(position + 2) === 0x0022
        ) {
          currentLine += body.slice(chunkStart, position);
          blockLines.push(currentLine);
          const token = createToken(
            lexer,
            TokenKind.BLOCK_STRING,
            start,
            position + 3, // Return a string of the lines joined with U+000A.
            dedentBlockStringLines(blockLines).join('\n'),
          );
          lexer.line += blockLines.length - 1;
          lexer.lineStart = lineStart;
          return token;
        } // Escaped Triple-Quote (\""")

        if (
          code === 0x005c &&
          body.charCodeAt(position + 1) === 0x0022 &&
          body.charCodeAt(position + 2) === 0x0022 &&
          body.charCodeAt(position + 3) === 0x0022
        ) {
          currentLine += body.slice(chunkStart, position);
          chunkStart = position + 1; // skip only slash

          position += 4;
          continue;
        } // LineTerminator

        if (code === 0x000a || code === 0x000d) {
          currentLine += body.slice(chunkStart, position);
          blockLines.push(currentLine);

          if (code === 0x000d && body.charCodeAt(position + 1) === 0x000a) {
            position += 2;
          } else {
            ++position;
          }

          currentLine = '';
          chunkStart = position;
          lineStart = position;
          continue;
        } // SourceCharacter

        if (isUnicodeScalarValue(code)) {
          ++position;
        } else if (isSupplementaryCodePoint(body, position)) {
          position += 2;
        } else {
          throw syntaxError(
            lexer.source,
            position,
            `Invalid character within String: ${printCodePointAt(
          lexer,
          position,
        )}.`,
          );
        }
      }

      throw syntaxError(lexer.source, position, 'Unterminated string.');
    }
    /**
     * Reads an alphanumeric + underscore name from the source.
     *
     * ```
     * Name ::
     *   - NameStart NameContinue* [lookahead != NameContinue]
     * ```
     */

    function readName(lexer, start) {
      const body = lexer.source.body;
      const bodyLength = body.length;
      let position = start + 1;

      while (position < bodyLength) {
        const code = body.charCodeAt(position);

        if (isNameContinue(code)) {
          ++position;
        } else {
          break;
        }
      }

      return createToken(
        lexer,
        TokenKind.NAME,
        start,
        position,
        body.slice(start, position),
      );
    }

    const MAX_ARRAY_LENGTH = 10;
    const MAX_RECURSIVE_DEPTH = 2;
    /**
     * Used to print values in error messages.
     */

    function inspect(value) {
      return formatValue(value, []);
    }

    function formatValue(value, seenValues) {
      switch (typeof value) {
        case 'string':
          return JSON.stringify(value);

        case 'function':
          return value.name ? `[function ${value.name}]` : '[function]';

        case 'object':
          return formatObjectValue(value, seenValues);

        default:
          return String(value);
      }
    }

    function formatObjectValue(value, previouslySeenValues) {
      if (value === null) {
        return 'null';
      }

      if (previouslySeenValues.includes(value)) {
        return '[Circular]';
      }

      const seenValues = [...previouslySeenValues, value];

      if (isJSONable(value)) {
        const jsonValue = value.toJSON(); // check for infinite recursion

        if (jsonValue !== value) {
          return typeof jsonValue === 'string'
            ? jsonValue
            : formatValue(jsonValue, seenValues);
        }
      } else if (Array.isArray(value)) {
        return formatArray(value, seenValues);
      }

      return formatObject(value, seenValues);
    }

    function isJSONable(value) {
      return typeof value.toJSON === 'function';
    }

    function formatObject(object, seenValues) {
      const entries = Object.entries(object);

      if (entries.length === 0) {
        return '{}';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[' + getObjectTag(object) + ']';
      }

      const properties = entries.map(
        ([key, value]) => key + ': ' + formatValue(value, seenValues),
      );
      return '{ ' + properties.join(', ') + ' }';
    }

    function formatArray(array, seenValues) {
      if (array.length === 0) {
        return '[]';
      }

      if (seenValues.length > MAX_RECURSIVE_DEPTH) {
        return '[Array]';
      }

      const len = Math.min(MAX_ARRAY_LENGTH, array.length);
      const remaining = array.length - len;
      const items = [];

      for (let i = 0; i < len; ++i) {
        items.push(formatValue(array[i], seenValues));
      }

      if (remaining === 1) {
        items.push('... 1 more item');
      } else if (remaining > 1) {
        items.push(`... ${remaining} more items`);
      }

      return '[' + items.join(', ') + ']';
    }

    function getObjectTag(object) {
      const tag = Object.prototype.toString
        .call(object)
        .replace(/^\[object /, '')
        .replace(/]$/, '');

      if (tag === 'Object' && typeof object.constructor === 'function') {
        const name = object.constructor.name;

        if (typeof name === 'string' && name !== '') {
          return name;
        }
      }

      return tag;
    }

    /**
     * A replacement for instanceof which includes an error warning when multi-realm
     * constructors are detected.
     * See: https://expressjs.com/en/advanced/best-practice-performance.html#set-node_env-to-production
     * See: https://webpack.js.org/guides/production/
     */

    const instanceOf =
      /* c8 ignore next 6 */
      // FIXME: https://github.com/graphql/graphql-js/issues/2317
      // eslint-disable-next-line no-undef
      process.env.NODE_ENV === 'production'
        ? function instanceOf(value, constructor) {
            return value instanceof constructor;
          }
        : function instanceOf(value, constructor) {
            if (value instanceof constructor) {
              return true;
            }

            if (typeof value === 'object' && value !== null) {
              var _value$constructor;

              // Prefer Symbol.toStringTag since it is immune to minification.
              const className = constructor.prototype[Symbol.toStringTag];
              const valueClassName = // We still need to support constructor's name to detect conflicts with older versions of this library.
                Symbol.toStringTag in value // @ts-expect-error TS bug see, https://github.com/microsoft/TypeScript/issues/38009
                  ? value[Symbol.toStringTag]
                  : (_value$constructor = value.constructor) === null ||
                    _value$constructor === void 0
                  ? void 0
                  : _value$constructor.name;

              if (className === valueClassName) {
                const stringifiedValue = inspect(value);
                throw new Error(`Cannot use ${className} "${stringifiedValue}" from another module or realm.

Ensure that there is only one instance of "graphql" in the node_modules
directory. If different versions of "graphql" are the dependencies of other
relied on modules, use "resolutions" to ensure only one version is installed.

https://yarnpkg.com/en/docs/selective-version-resolutions

Duplicate "graphql" modules cannot be used at the same time since different
versions may have different capabilities and behavior. The data from one
version used in the function from another could produce confusing and
spurious results.`);
              }
            }

            return false;
          };

    /**
     * A representation of source input to GraphQL. The `name` and `locationOffset` parameters are
     * optional, but they are useful for clients who store GraphQL documents in source files.
     * For example, if the GraphQL input starts at line 40 in a file named `Foo.graphql`, it might
     * be useful for `name` to be `"Foo.graphql"` and location to be `{ line: 40, column: 1 }`.
     * The `line` and `column` properties in `locationOffset` are 1-indexed.
     */
    class Source {
      constructor(
        body,
        name = 'GraphQL request',
        locationOffset = {
          line: 1,
          column: 1,
        },
      ) {
        typeof body === 'string' ||
          devAssert(false, `Body must be a string. Received: ${inspect(body)}.`);
        this.body = body;
        this.name = name;
        this.locationOffset = locationOffset;
        this.locationOffset.line > 0 ||
          devAssert(
            false,
            'line in locationOffset is 1-indexed and must be positive.',
          );
        this.locationOffset.column > 0 ||
          devAssert(
            false,
            'column in locationOffset is 1-indexed and must be positive.',
          );
      }

      get [Symbol.toStringTag]() {
        return 'Source';
      }
    }
    /**
     * Test if the given value is a Source object.
     *
     * @internal
     */

    function isSource(source) {
      return instanceOf(source, Source);
    }

    /**
     * Configuration options to control parser behavior
     */

    /**
     * Given a GraphQL source, parses it into a Document.
     * Throws GraphQLError if a syntax error is encountered.
     */
    function parse$1(source, options) {
      const parser = new Parser(source, options);
      return parser.parseDocument();
    }
    /**
     * This class is exported only to assist people in implementing their own parsers
     * without duplicating too much code and should be used only as last resort for cases
     * such as experimental syntax or if certain features could not be contributed upstream.
     *
     * It is still part of the internal API and is versioned, so any changes to it are never
     * considered breaking changes. If you still need to support multiple versions of the
     * library, please use the `versionInfo` variable for version detection.
     *
     * @internal
     */

    class Parser {
      constructor(source, options) {
        const sourceObj = isSource(source) ? source : new Source(source);
        this._lexer = new Lexer(sourceObj);
        this._options = options;
      }
      /**
       * Converts a name lex token into a name parse node.
       */

      parseName() {
        const token = this.expectToken(TokenKind.NAME);
        return this.node(token, {
          kind: Kind.NAME,
          value: token.value,
        });
      } // Implements the parsing rules in the Document section.

      /**
       * Document : Definition+
       */

      parseDocument() {
        return this.node(this._lexer.token, {
          kind: Kind.DOCUMENT,
          definitions: this.many(
            TokenKind.SOF,
            this.parseDefinition,
            TokenKind.EOF,
          ),
        });
      }
      /**
       * Definition :
       *   - ExecutableDefinition
       *   - TypeSystemDefinition
       *   - TypeSystemExtension
       *
       * ExecutableDefinition :
       *   - OperationDefinition
       *   - FragmentDefinition
       *
       * TypeSystemDefinition :
       *   - SchemaDefinition
       *   - TypeDefinition
       *   - DirectiveDefinition
       *
       * TypeDefinition :
       *   - ScalarTypeDefinition
       *   - ObjectTypeDefinition
       *   - InterfaceTypeDefinition
       *   - UnionTypeDefinition
       *   - EnumTypeDefinition
       *   - InputObjectTypeDefinition
       */

      parseDefinition() {
        if (this.peek(TokenKind.BRACE_L)) {
          return this.parseOperationDefinition();
        } // Many definitions begin with a description and require a lookahead.

        const hasDescription = this.peekDescription();
        const keywordToken = hasDescription
          ? this._lexer.lookahead()
          : this._lexer.token;

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaDefinition();

            case 'scalar':
              return this.parseScalarTypeDefinition();

            case 'type':
              return this.parseObjectTypeDefinition();

            case 'interface':
              return this.parseInterfaceTypeDefinition();

            case 'union':
              return this.parseUnionTypeDefinition();

            case 'enum':
              return this.parseEnumTypeDefinition();

            case 'input':
              return this.parseInputObjectTypeDefinition();

            case 'directive':
              return this.parseDirectiveDefinition();
          }

          if (hasDescription) {
            throw syntaxError(
              this._lexer.source,
              this._lexer.token.start,
              'Unexpected description, descriptions are supported only on type definitions.',
            );
          }

          switch (keywordToken.value) {
            case 'query':
            case 'mutation':
            case 'subscription':
              return this.parseOperationDefinition();

            case 'fragment':
              return this.parseFragmentDefinition();

            case 'extend':
              return this.parseTypeSystemExtension();
          }
        }

        throw this.unexpected(keywordToken);
      } // Implements the parsing rules in the Operations section.

      /**
       * OperationDefinition :
       *  - SelectionSet
       *  - OperationType Name? VariableDefinitions? Directives? SelectionSet
       */

      parseOperationDefinition() {
        const start = this._lexer.token;

        if (this.peek(TokenKind.BRACE_L)) {
          return this.node(start, {
            kind: Kind.OPERATION_DEFINITION,
            operation: OperationTypeNode.QUERY,
            name: undefined,
            variableDefinitions: [],
            directives: [],
            selectionSet: this.parseSelectionSet(),
          });
        }

        const operation = this.parseOperationType();
        let name;

        if (this.peek(TokenKind.NAME)) {
          name = this.parseName();
        }

        return this.node(start, {
          kind: Kind.OPERATION_DEFINITION,
          operation,
          name,
          variableDefinitions: this.parseVariableDefinitions(),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
        });
      }
      /**
       * OperationType : one of query mutation subscription
       */

      parseOperationType() {
        const operationToken = this.expectToken(TokenKind.NAME);

        switch (operationToken.value) {
          case 'query':
            return OperationTypeNode.QUERY;

          case 'mutation':
            return OperationTypeNode.MUTATION;

          case 'subscription':
            return OperationTypeNode.SUBSCRIPTION;
        }

        throw this.unexpected(operationToken);
      }
      /**
       * VariableDefinitions : ( VariableDefinition+ )
       */

      parseVariableDefinitions() {
        return this.optionalMany(
          TokenKind.PAREN_L,
          this.parseVariableDefinition,
          TokenKind.PAREN_R,
        );
      }
      /**
       * VariableDefinition : Variable : Type DefaultValue? Directives[Const]?
       */

      parseVariableDefinition() {
        return this.node(this._lexer.token, {
          kind: Kind.VARIABLE_DEFINITION,
          variable: this.parseVariable(),
          type: (this.expectToken(TokenKind.COLON), this.parseTypeReference()),
          defaultValue: this.expectOptionalToken(TokenKind.EQUALS)
            ? this.parseConstValueLiteral()
            : undefined,
          directives: this.parseConstDirectives(),
        });
      }
      /**
       * Variable : $ Name
       */

      parseVariable() {
        const start = this._lexer.token;
        this.expectToken(TokenKind.DOLLAR);
        return this.node(start, {
          kind: Kind.VARIABLE,
          name: this.parseName(),
        });
      }
      /**
       * ```
       * SelectionSet : { Selection+ }
       * ```
       */

      parseSelectionSet() {
        return this.node(this._lexer.token, {
          kind: Kind.SELECTION_SET,
          selections: this.many(
            TokenKind.BRACE_L,
            this.parseSelection,
            TokenKind.BRACE_R,
          ),
        });
      }
      /**
       * Selection :
       *   - Field
       *   - FragmentSpread
       *   - InlineFragment
       */

      parseSelection() {
        return this.peek(TokenKind.SPREAD)
          ? this.parseFragment()
          : this.parseField();
      }
      /**
       * Field : Alias? Name Arguments? Directives? SelectionSet?
       *
       * Alias : Name :
       */

      parseField() {
        const start = this._lexer.token;
        const nameOrAlias = this.parseName();
        let alias;
        let name;

        if (this.expectOptionalToken(TokenKind.COLON)) {
          alias = nameOrAlias;
          name = this.parseName();
        } else {
          name = nameOrAlias;
        }

        return this.node(start, {
          kind: Kind.FIELD,
          alias,
          name,
          arguments: this.parseArguments(false),
          directives: this.parseDirectives(false),
          selectionSet: this.peek(TokenKind.BRACE_L)
            ? this.parseSelectionSet()
            : undefined,
        });
      }
      /**
       * Arguments[Const] : ( Argument[?Const]+ )
       */

      parseArguments(isConst) {
        const item = isConst ? this.parseConstArgument : this.parseArgument;
        return this.optionalMany(TokenKind.PAREN_L, item, TokenKind.PAREN_R);
      }
      /**
       * Argument[Const] : Name : Value[?Const]
       */

      parseArgument(isConst = false) {
        const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return this.node(start, {
          kind: Kind.ARGUMENT,
          name,
          value: this.parseValueLiteral(isConst),
        });
      }

      parseConstArgument() {
        return this.parseArgument(true);
      } // Implements the parsing rules in the Fragments section.

      /**
       * Corresponds to both FragmentSpread and InlineFragment in the spec.
       *
       * FragmentSpread : ... FragmentName Directives?
       *
       * InlineFragment : ... TypeCondition? Directives? SelectionSet
       */

      parseFragment() {
        const start = this._lexer.token;
        this.expectToken(TokenKind.SPREAD);
        const hasTypeCondition = this.expectOptionalKeyword('on');

        if (!hasTypeCondition && this.peek(TokenKind.NAME)) {
          return this.node(start, {
            kind: Kind.FRAGMENT_SPREAD,
            name: this.parseFragmentName(),
            directives: this.parseDirectives(false),
          });
        }

        return this.node(start, {
          kind: Kind.INLINE_FRAGMENT,
          typeCondition: hasTypeCondition ? this.parseNamedType() : undefined,
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
        });
      }
      /**
       * FragmentDefinition :
       *   - fragment FragmentName on TypeCondition Directives? SelectionSet
       *
       * TypeCondition : NamedType
       */

      parseFragmentDefinition() {
        var _this$_options;

        const start = this._lexer.token;
        this.expectKeyword('fragment'); // Legacy support for defining variables within fragments changes
        // the grammar of FragmentDefinition:
        //   - fragment FragmentName VariableDefinitions? on TypeCondition Directives? SelectionSet

        if (
          ((_this$_options = this._options) === null || _this$_options === void 0
            ? void 0
            : _this$_options.allowLegacyFragmentVariables) === true
        ) {
          return this.node(start, {
            kind: Kind.FRAGMENT_DEFINITION,
            name: this.parseFragmentName(),
            variableDefinitions: this.parseVariableDefinitions(),
            typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
            directives: this.parseDirectives(false),
            selectionSet: this.parseSelectionSet(),
          });
        }

        return this.node(start, {
          kind: Kind.FRAGMENT_DEFINITION,
          name: this.parseFragmentName(),
          typeCondition: (this.expectKeyword('on'), this.parseNamedType()),
          directives: this.parseDirectives(false),
          selectionSet: this.parseSelectionSet(),
        });
      }
      /**
       * FragmentName : Name but not `on`
       */

      parseFragmentName() {
        if (this._lexer.token.value === 'on') {
          throw this.unexpected();
        }

        return this.parseName();
      } // Implements the parsing rules in the Values section.

      /**
       * Value[Const] :
       *   - [~Const] Variable
       *   - IntValue
       *   - FloatValue
       *   - StringValue
       *   - BooleanValue
       *   - NullValue
       *   - EnumValue
       *   - ListValue[?Const]
       *   - ObjectValue[?Const]
       *
       * BooleanValue : one of `true` `false`
       *
       * NullValue : `null`
       *
       * EnumValue : Name but not `true`, `false` or `null`
       */

      parseValueLiteral(isConst) {
        const token = this._lexer.token;

        switch (token.kind) {
          case TokenKind.BRACKET_L:
            return this.parseList(isConst);

          case TokenKind.BRACE_L:
            return this.parseObject(isConst);

          case TokenKind.INT:
            this._lexer.advance();

            return this.node(token, {
              kind: Kind.INT,
              value: token.value,
            });

          case TokenKind.FLOAT:
            this._lexer.advance();

            return this.node(token, {
              kind: Kind.FLOAT,
              value: token.value,
            });

          case TokenKind.STRING:
          case TokenKind.BLOCK_STRING:
            return this.parseStringLiteral();

          case TokenKind.NAME:
            this._lexer.advance();

            switch (token.value) {
              case 'true':
                return this.node(token, {
                  kind: Kind.BOOLEAN,
                  value: true,
                });

              case 'false':
                return this.node(token, {
                  kind: Kind.BOOLEAN,
                  value: false,
                });

              case 'null':
                return this.node(token, {
                  kind: Kind.NULL,
                });

              default:
                return this.node(token, {
                  kind: Kind.ENUM,
                  value: token.value,
                });
            }

          case TokenKind.DOLLAR:
            if (isConst) {
              this.expectToken(TokenKind.DOLLAR);

              if (this._lexer.token.kind === TokenKind.NAME) {
                const varName = this._lexer.token.value;
                throw syntaxError(
                  this._lexer.source,
                  token.start,
                  `Unexpected variable "$${varName}" in constant value.`,
                );
              } else {
                throw this.unexpected(token);
              }
            }

            return this.parseVariable();

          default:
            throw this.unexpected();
        }
      }

      parseConstValueLiteral() {
        return this.parseValueLiteral(true);
      }

      parseStringLiteral() {
        const token = this._lexer.token;

        this._lexer.advance();

        return this.node(token, {
          kind: Kind.STRING,
          value: token.value,
          block: token.kind === TokenKind.BLOCK_STRING,
        });
      }
      /**
       * ListValue[Const] :
       *   - [ ]
       *   - [ Value[?Const]+ ]
       */

      parseList(isConst) {
        const item = () => this.parseValueLiteral(isConst);

        return this.node(this._lexer.token, {
          kind: Kind.LIST,
          values: this.any(TokenKind.BRACKET_L, item, TokenKind.BRACKET_R),
        });
      }
      /**
       * ```
       * ObjectValue[Const] :
       *   - { }
       *   - { ObjectField[?Const]+ }
       * ```
       */

      parseObject(isConst) {
        const item = () => this.parseObjectField(isConst);

        return this.node(this._lexer.token, {
          kind: Kind.OBJECT,
          fields: this.any(TokenKind.BRACE_L, item, TokenKind.BRACE_R),
        });
      }
      /**
       * ObjectField[Const] : Name : Value[?Const]
       */

      parseObjectField(isConst) {
        const start = this._lexer.token;
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        return this.node(start, {
          kind: Kind.OBJECT_FIELD,
          name,
          value: this.parseValueLiteral(isConst),
        });
      } // Implements the parsing rules in the Directives section.

      /**
       * Directives[Const] : Directive[?Const]+
       */

      parseDirectives(isConst) {
        const directives = [];

        while (this.peek(TokenKind.AT)) {
          directives.push(this.parseDirective(isConst));
        }

        return directives;
      }

      parseConstDirectives() {
        return this.parseDirectives(true);
      }
      /**
       * ```
       * Directive[Const] : @ Name Arguments[?Const]?
       * ```
       */

      parseDirective(isConst) {
        const start = this._lexer.token;
        this.expectToken(TokenKind.AT);
        return this.node(start, {
          kind: Kind.DIRECTIVE,
          name: this.parseName(),
          arguments: this.parseArguments(isConst),
        });
      } // Implements the parsing rules in the Types section.

      /**
       * Type :
       *   - NamedType
       *   - ListType
       *   - NonNullType
       */

      parseTypeReference() {
        const start = this._lexer.token;
        let type;

        if (this.expectOptionalToken(TokenKind.BRACKET_L)) {
          const innerType = this.parseTypeReference();
          this.expectToken(TokenKind.BRACKET_R);
          type = this.node(start, {
            kind: Kind.LIST_TYPE,
            type: innerType,
          });
        } else {
          type = this.parseNamedType();
        }

        if (this.expectOptionalToken(TokenKind.BANG)) {
          return this.node(start, {
            kind: Kind.NON_NULL_TYPE,
            type,
          });
        }

        return type;
      }
      /**
       * NamedType : Name
       */

      parseNamedType() {
        return this.node(this._lexer.token, {
          kind: Kind.NAMED_TYPE,
          name: this.parseName(),
        });
      } // Implements the parsing rules in the Type Definition section.

      peekDescription() {
        return this.peek(TokenKind.STRING) || this.peek(TokenKind.BLOCK_STRING);
      }
      /**
       * Description : StringValue
       */

      parseDescription() {
        if (this.peekDescription()) {
          return this.parseStringLiteral();
        }
      }
      /**
       * ```
       * SchemaDefinition : Description? schema Directives[Const]? { OperationTypeDefinition+ }
       * ```
       */

      parseSchemaDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('schema');
        const directives = this.parseConstDirectives();
        const operationTypes = this.many(
          TokenKind.BRACE_L,
          this.parseOperationTypeDefinition,
          TokenKind.BRACE_R,
        );
        return this.node(start, {
          kind: Kind.SCHEMA_DEFINITION,
          description,
          directives,
          operationTypes,
        });
      }
      /**
       * OperationTypeDefinition : OperationType : NamedType
       */

      parseOperationTypeDefinition() {
        const start = this._lexer.token;
        const operation = this.parseOperationType();
        this.expectToken(TokenKind.COLON);
        const type = this.parseNamedType();
        return this.node(start, {
          kind: Kind.OPERATION_TYPE_DEFINITION,
          operation,
          type,
        });
      }
      /**
       * ScalarTypeDefinition : Description? scalar Name Directives[Const]?
       */

      parseScalarTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        return this.node(start, {
          kind: Kind.SCALAR_TYPE_DEFINITION,
          description,
          name,
          directives,
        });
      }
      /**
       * ObjectTypeDefinition :
       *   Description?
       *   type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition?
       */

      parseObjectTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        return this.node(start, {
          kind: Kind.OBJECT_TYPE_DEFINITION,
          description,
          name,
          interfaces,
          directives,
          fields,
        });
      }
      /**
       * ImplementsInterfaces :
       *   - implements `&`? NamedType
       *   - ImplementsInterfaces & NamedType
       */

      parseImplementsInterfaces() {
        return this.expectOptionalKeyword('implements')
          ? this.delimitedMany(TokenKind.AMP, this.parseNamedType)
          : [];
      }
      /**
       * ```
       * FieldsDefinition : { FieldDefinition+ }
       * ```
       */

      parseFieldsDefinition() {
        return this.optionalMany(
          TokenKind.BRACE_L,
          this.parseFieldDefinition,
          TokenKind.BRACE_R,
        );
      }
      /**
       * FieldDefinition :
       *   - Description? Name ArgumentsDefinition? : Type Directives[Const]?
       */

      parseFieldDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        const args = this.parseArgumentDefs();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        const directives = this.parseConstDirectives();
        return this.node(start, {
          kind: Kind.FIELD_DEFINITION,
          description,
          name,
          arguments: args,
          type,
          directives,
        });
      }
      /**
       * ArgumentsDefinition : ( InputValueDefinition+ )
       */

      parseArgumentDefs() {
        return this.optionalMany(
          TokenKind.PAREN_L,
          this.parseInputValueDef,
          TokenKind.PAREN_R,
        );
      }
      /**
       * InputValueDefinition :
       *   - Description? Name : Type DefaultValue? Directives[Const]?
       */

      parseInputValueDef() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseName();
        this.expectToken(TokenKind.COLON);
        const type = this.parseTypeReference();
        let defaultValue;

        if (this.expectOptionalToken(TokenKind.EQUALS)) {
          defaultValue = this.parseConstValueLiteral();
        }

        const directives = this.parseConstDirectives();
        return this.node(start, {
          kind: Kind.INPUT_VALUE_DEFINITION,
          description,
          name,
          type,
          defaultValue,
          directives,
        });
      }
      /**
       * InterfaceTypeDefinition :
       *   - Description? interface Name Directives[Const]? FieldsDefinition?
       */

      parseInterfaceTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();
        return this.node(start, {
          kind: Kind.INTERFACE_TYPE_DEFINITION,
          description,
          name,
          interfaces,
          directives,
          fields,
        });
      }
      /**
       * UnionTypeDefinition :
       *   - Description? union Name Directives[Const]? UnionMemberTypes?
       */

      parseUnionTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const types = this.parseUnionMemberTypes();
        return this.node(start, {
          kind: Kind.UNION_TYPE_DEFINITION,
          description,
          name,
          directives,
          types,
        });
      }
      /**
       * UnionMemberTypes :
       *   - = `|`? NamedType
       *   - UnionMemberTypes | NamedType
       */

      parseUnionMemberTypes() {
        return this.expectOptionalToken(TokenKind.EQUALS)
          ? this.delimitedMany(TokenKind.PIPE, this.parseNamedType)
          : [];
      }
      /**
       * EnumTypeDefinition :
       *   - Description? enum Name Directives[Const]? EnumValuesDefinition?
       */

      parseEnumTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const values = this.parseEnumValuesDefinition();
        return this.node(start, {
          kind: Kind.ENUM_TYPE_DEFINITION,
          description,
          name,
          directives,
          values,
        });
      }
      /**
       * ```
       * EnumValuesDefinition : { EnumValueDefinition+ }
       * ```
       */

      parseEnumValuesDefinition() {
        return this.optionalMany(
          TokenKind.BRACE_L,
          this.parseEnumValueDefinition,
          TokenKind.BRACE_R,
        );
      }
      /**
       * EnumValueDefinition : Description? EnumValue Directives[Const]?
       */

      parseEnumValueDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        const name = this.parseEnumValueName();
        const directives = this.parseConstDirectives();
        return this.node(start, {
          kind: Kind.ENUM_VALUE_DEFINITION,
          description,
          name,
          directives,
        });
      }
      /**
       * EnumValue : Name but not `true`, `false` or `null`
       */

      parseEnumValueName() {
        if (
          this._lexer.token.value === 'true' ||
          this._lexer.token.value === 'false' ||
          this._lexer.token.value === 'null'
        ) {
          throw syntaxError(
            this._lexer.source,
            this._lexer.token.start,
            `${getTokenDesc(
          this._lexer.token,
        )} is reserved and cannot be used for an enum value.`,
          );
        }

        return this.parseName();
      }
      /**
       * InputObjectTypeDefinition :
       *   - Description? input Name Directives[Const]? InputFieldsDefinition?
       */

      parseInputObjectTypeDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const fields = this.parseInputFieldsDefinition();
        return this.node(start, {
          kind: Kind.INPUT_OBJECT_TYPE_DEFINITION,
          description,
          name,
          directives,
          fields,
        });
      }
      /**
       * ```
       * InputFieldsDefinition : { InputValueDefinition+ }
       * ```
       */

      parseInputFieldsDefinition() {
        return this.optionalMany(
          TokenKind.BRACE_L,
          this.parseInputValueDef,
          TokenKind.BRACE_R,
        );
      }
      /**
       * TypeSystemExtension :
       *   - SchemaExtension
       *   - TypeExtension
       *
       * TypeExtension :
       *   - ScalarTypeExtension
       *   - ObjectTypeExtension
       *   - InterfaceTypeExtension
       *   - UnionTypeExtension
       *   - EnumTypeExtension
       *   - InputObjectTypeDefinition
       */

      parseTypeSystemExtension() {
        const keywordToken = this._lexer.lookahead();

        if (keywordToken.kind === TokenKind.NAME) {
          switch (keywordToken.value) {
            case 'schema':
              return this.parseSchemaExtension();

            case 'scalar':
              return this.parseScalarTypeExtension();

            case 'type':
              return this.parseObjectTypeExtension();

            case 'interface':
              return this.parseInterfaceTypeExtension();

            case 'union':
              return this.parseUnionTypeExtension();

            case 'enum':
              return this.parseEnumTypeExtension();

            case 'input':
              return this.parseInputObjectTypeExtension();
          }
        }

        throw this.unexpected(keywordToken);
      }
      /**
       * ```
       * SchemaExtension :
       *  - extend schema Directives[Const]? { OperationTypeDefinition+ }
       *  - extend schema Directives[Const]
       * ```
       */

      parseSchemaExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('schema');
        const directives = this.parseConstDirectives();
        const operationTypes = this.optionalMany(
          TokenKind.BRACE_L,
          this.parseOperationTypeDefinition,
          TokenKind.BRACE_R,
        );

        if (directives.length === 0 && operationTypes.length === 0) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.SCHEMA_EXTENSION,
          directives,
          operationTypes,
        });
      }
      /**
       * ScalarTypeExtension :
       *   - extend scalar Name Directives[Const]
       */

      parseScalarTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('scalar');
        const name = this.parseName();
        const directives = this.parseConstDirectives();

        if (directives.length === 0) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.SCALAR_TYPE_EXTENSION,
          name,
          directives,
        });
      }
      /**
       * ObjectTypeExtension :
       *  - extend type Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend type Name ImplementsInterfaces? Directives[Const]
       *  - extend type Name ImplementsInterfaces
       */

      parseObjectTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('type');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();

        if (
          interfaces.length === 0 &&
          directives.length === 0 &&
          fields.length === 0
        ) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.OBJECT_TYPE_EXTENSION,
          name,
          interfaces,
          directives,
          fields,
        });
      }
      /**
       * InterfaceTypeExtension :
       *  - extend interface Name ImplementsInterfaces? Directives[Const]? FieldsDefinition
       *  - extend interface Name ImplementsInterfaces? Directives[Const]
       *  - extend interface Name ImplementsInterfaces
       */

      parseInterfaceTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('interface');
        const name = this.parseName();
        const interfaces = this.parseImplementsInterfaces();
        const directives = this.parseConstDirectives();
        const fields = this.parseFieldsDefinition();

        if (
          interfaces.length === 0 &&
          directives.length === 0 &&
          fields.length === 0
        ) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.INTERFACE_TYPE_EXTENSION,
          name,
          interfaces,
          directives,
          fields,
        });
      }
      /**
       * UnionTypeExtension :
       *   - extend union Name Directives[Const]? UnionMemberTypes
       *   - extend union Name Directives[Const]
       */

      parseUnionTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('union');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const types = this.parseUnionMemberTypes();

        if (directives.length === 0 && types.length === 0) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.UNION_TYPE_EXTENSION,
          name,
          directives,
          types,
        });
      }
      /**
       * EnumTypeExtension :
       *   - extend enum Name Directives[Const]? EnumValuesDefinition
       *   - extend enum Name Directives[Const]
       */

      parseEnumTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('enum');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const values = this.parseEnumValuesDefinition();

        if (directives.length === 0 && values.length === 0) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.ENUM_TYPE_EXTENSION,
          name,
          directives,
          values,
        });
      }
      /**
       * InputObjectTypeExtension :
       *   - extend input Name Directives[Const]? InputFieldsDefinition
       *   - extend input Name Directives[Const]
       */

      parseInputObjectTypeExtension() {
        const start = this._lexer.token;
        this.expectKeyword('extend');
        this.expectKeyword('input');
        const name = this.parseName();
        const directives = this.parseConstDirectives();
        const fields = this.parseInputFieldsDefinition();

        if (directives.length === 0 && fields.length === 0) {
          throw this.unexpected();
        }

        return this.node(start, {
          kind: Kind.INPUT_OBJECT_TYPE_EXTENSION,
          name,
          directives,
          fields,
        });
      }
      /**
       * ```
       * DirectiveDefinition :
       *   - Description? directive @ Name ArgumentsDefinition? `repeatable`? on DirectiveLocations
       * ```
       */

      parseDirectiveDefinition() {
        const start = this._lexer.token;
        const description = this.parseDescription();
        this.expectKeyword('directive');
        this.expectToken(TokenKind.AT);
        const name = this.parseName();
        const args = this.parseArgumentDefs();
        const repeatable = this.expectOptionalKeyword('repeatable');
        this.expectKeyword('on');
        const locations = this.parseDirectiveLocations();
        return this.node(start, {
          kind: Kind.DIRECTIVE_DEFINITION,
          description,
          name,
          arguments: args,
          repeatable,
          locations,
        });
      }
      /**
       * DirectiveLocations :
       *   - `|`? DirectiveLocation
       *   - DirectiveLocations | DirectiveLocation
       */

      parseDirectiveLocations() {
        return this.delimitedMany(TokenKind.PIPE, this.parseDirectiveLocation);
      }
      /*
       * DirectiveLocation :
       *   - ExecutableDirectiveLocation
       *   - TypeSystemDirectiveLocation
       *
       * ExecutableDirectiveLocation : one of
       *   `QUERY`
       *   `MUTATION`
       *   `SUBSCRIPTION`
       *   `FIELD`
       *   `FRAGMENT_DEFINITION`
       *   `FRAGMENT_SPREAD`
       *   `INLINE_FRAGMENT`
       *
       * TypeSystemDirectiveLocation : one of
       *   `SCHEMA`
       *   `SCALAR`
       *   `OBJECT`
       *   `FIELD_DEFINITION`
       *   `ARGUMENT_DEFINITION`
       *   `INTERFACE`
       *   `UNION`
       *   `ENUM`
       *   `ENUM_VALUE`
       *   `INPUT_OBJECT`
       *   `INPUT_FIELD_DEFINITION`
       */

      parseDirectiveLocation() {
        const start = this._lexer.token;
        const name = this.parseName();

        if (Object.prototype.hasOwnProperty.call(DirectiveLocation, name.value)) {
          return name;
        }

        throw this.unexpected(start);
      } // Core parsing utility functions

      /**
       * Returns a node that, if configured to do so, sets a "loc" field as a
       * location object, used to identify the place in the source that created a
       * given parsed object.
       */

      node(startToken, node) {
        var _this$_options2;

        if (
          ((_this$_options2 = this._options) === null || _this$_options2 === void 0
            ? void 0
            : _this$_options2.noLocation) !== true
        ) {
          node.loc = new Location(
            startToken,
            this._lexer.lastToken,
            this._lexer.source,
          );
        }

        return node;
      }
      /**
       * Determines if the next token is of a given kind
       */

      peek(kind) {
        return this._lexer.token.kind === kind;
      }
      /**
       * If the next token is of the given kind, return that token after advancing the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */

      expectToken(kind) {
        const token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return token;
        }

        throw syntaxError(
          this._lexer.source,
          token.start,
          `Expected ${getTokenKindDesc(kind)}, found ${getTokenDesc(token)}.`,
        );
      }
      /**
       * If the next token is of the given kind, return "true" after advancing the lexer.
       * Otherwise, do not change the parser state and return "false".
       */

      expectOptionalToken(kind) {
        const token = this._lexer.token;

        if (token.kind === kind) {
          this._lexer.advance();

          return true;
        }

        return false;
      }
      /**
       * If the next token is a given keyword, advance the lexer.
       * Otherwise, do not change the parser state and throw an error.
       */

      expectKeyword(value) {
        const token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();
        } else {
          throw syntaxError(
            this._lexer.source,
            token.start,
            `Expected "${value}", found ${getTokenDesc(token)}.`,
          );
        }
      }
      /**
       * If the next token is a given keyword, return "true" after advancing the lexer.
       * Otherwise, do not change the parser state and return "false".
       */

      expectOptionalKeyword(value) {
        const token = this._lexer.token;

        if (token.kind === TokenKind.NAME && token.value === value) {
          this._lexer.advance();

          return true;
        }

        return false;
      }
      /**
       * Helper function for creating an error when an unexpected lexed token is encountered.
       */

      unexpected(atToken) {
        const token =
          atToken !== null && atToken !== void 0 ? atToken : this._lexer.token;
        return syntaxError(
          this._lexer.source,
          token.start,
          `Unexpected ${getTokenDesc(token)}.`,
        );
      }
      /**
       * Returns a possibly empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */

      any(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];

        while (!this.expectOptionalToken(closeKind)) {
          nodes.push(parseFn.call(this));
        }

        return nodes;
      }
      /**
       * Returns a list of parse nodes, determined by the parseFn.
       * It can be empty only if open token is missing otherwise it will always return non-empty list
       * that begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */

      optionalMany(openKind, parseFn, closeKind) {
        if (this.expectOptionalToken(openKind)) {
          const nodes = [];

          do {
            nodes.push(parseFn.call(this));
          } while (!this.expectOptionalToken(closeKind));

          return nodes;
        }

        return [];
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list begins with a lex token of openKind and ends with a lex token of closeKind.
       * Advances the parser to the next lex token after the closing token.
       */

      many(openKind, parseFn, closeKind) {
        this.expectToken(openKind);
        const nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (!this.expectOptionalToken(closeKind));

        return nodes;
      }
      /**
       * Returns a non-empty list of parse nodes, determined by the parseFn.
       * This list may begin with a lex token of delimiterKind followed by items separated by lex tokens of tokenKind.
       * Advances the parser to the next lex token after last item in the list.
       */

      delimitedMany(delimiterKind, parseFn) {
        this.expectOptionalToken(delimiterKind);
        const nodes = [];

        do {
          nodes.push(parseFn.call(this));
        } while (this.expectOptionalToken(delimiterKind));

        return nodes;
      }
    }
    /**
     * A helper function to describe a token as a string for debugging.
     */

    function getTokenDesc(token) {
      const value = token.value;
      return getTokenKindDesc(token.kind) + (value != null ? ` "${value}"` : '');
    }
    /**
     * A helper function to describe a token kind as a string for debugging.
     */

    function getTokenKindDesc(kind) {
      return isPunctuatorTokenKind(kind) ? `"${kind}"` : kind;
    }

    /**
     * Prints a string as a GraphQL StringValue literal. Replaces control characters
     * and excluded characters (" U+0022 and \\ U+005C) with escape sequences.
     */
    function printString(str) {
      return `"${str.replace(escapedRegExp, escapedReplacer)}"`;
    } // eslint-disable-next-line no-control-regex

    const escapedRegExp = /[\x00-\x1f\x22\x5c\x7f-\x9f]/g;

    function escapedReplacer(str) {
      return escapeSequences[str.charCodeAt(0)];
    } // prettier-ignore

    const escapeSequences = [
      '\\u0000',
      '\\u0001',
      '\\u0002',
      '\\u0003',
      '\\u0004',
      '\\u0005',
      '\\u0006',
      '\\u0007',
      '\\b',
      '\\t',
      '\\n',
      '\\u000B',
      '\\f',
      '\\r',
      '\\u000E',
      '\\u000F',
      '\\u0010',
      '\\u0011',
      '\\u0012',
      '\\u0013',
      '\\u0014',
      '\\u0015',
      '\\u0016',
      '\\u0017',
      '\\u0018',
      '\\u0019',
      '\\u001A',
      '\\u001B',
      '\\u001C',
      '\\u001D',
      '\\u001E',
      '\\u001F',
      '',
      '',
      '\\"',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // 2F
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // 3F
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // 4F
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '\\\\',
      '',
      '',
      '', // 5F
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '', // 6F
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '\\u007F',
      '\\u0080',
      '\\u0081',
      '\\u0082',
      '\\u0083',
      '\\u0084',
      '\\u0085',
      '\\u0086',
      '\\u0087',
      '\\u0088',
      '\\u0089',
      '\\u008A',
      '\\u008B',
      '\\u008C',
      '\\u008D',
      '\\u008E',
      '\\u008F',
      '\\u0090',
      '\\u0091',
      '\\u0092',
      '\\u0093',
      '\\u0094',
      '\\u0095',
      '\\u0096',
      '\\u0097',
      '\\u0098',
      '\\u0099',
      '\\u009A',
      '\\u009B',
      '\\u009C',
      '\\u009D',
      '\\u009E',
      '\\u009F',
    ];

    /**
     * A visitor is provided to visit, it contains the collection of
     * relevant functions to be called during the visitor's traversal.
     */

    const BREAK = Object.freeze({});
    /**
     * visit() will walk through an AST using a depth-first traversal, calling
     * the visitor's enter function at each node in the traversal, and calling the
     * leave function after visiting that node and all of its child nodes.
     *
     * By returning different values from the enter and leave functions, the
     * behavior of the visitor can be altered, including skipping over a sub-tree of
     * the AST (by returning false), editing the AST by returning a value or null
     * to remove the value, or to stop the whole traversal by returning BREAK.
     *
     * When using visit() to edit an AST, the original AST will not be modified, and
     * a new version of the AST with the changes applied will be returned from the
     * visit function.
     *
     * ```ts
     * const editedAST = visit(ast, {
     *   enter(node, key, parent, path, ancestors) {
     *     // @return
     *     //   undefined: no action
     *     //   false: skip visiting this node
     *     //   visitor.BREAK: stop visiting altogether
     *     //   null: delete this node
     *     //   any value: replace this node with the returned value
     *   },
     *   leave(node, key, parent, path, ancestors) {
     *     // @return
     *     //   undefined: no action
     *     //   false: no action
     *     //   visitor.BREAK: stop visiting altogether
     *     //   null: delete this node
     *     //   any value: replace this node with the returned value
     *   }
     * });
     * ```
     *
     * Alternatively to providing enter() and leave() functions, a visitor can
     * instead provide functions named the same as the kinds of AST nodes, or
     * enter/leave visitors at a named key, leading to three permutations of the
     * visitor API:
     *
     * 1) Named visitors triggered when entering a node of a specific kind.
     *
     * ```ts
     * visit(ast, {
     *   Kind(node) {
     *     // enter the "Kind" node
     *   }
     * })
     * ```
     *
     * 2) Named visitors that trigger upon entering and leaving a node of a specific kind.
     *
     * ```ts
     * visit(ast, {
     *   Kind: {
     *     enter(node) {
     *       // enter the "Kind" node
     *     }
     *     leave(node) {
     *       // leave the "Kind" node
     *     }
     *   }
     * })
     * ```
     *
     * 3) Generic visitors that trigger upon entering and leaving any node.
     *
     * ```ts
     * visit(ast, {
     *   enter(node) {
     *     // enter any node
     *   },
     *   leave(node) {
     *     // leave any node
     *   }
     * })
     * ```
     */

    function visit(root, visitor, visitorKeys = QueryDocumentKeys) {
      const enterLeaveMap = new Map();

      for (const kind of Object.values(Kind)) {
        enterLeaveMap.set(kind, getEnterLeaveForKind(visitor, kind));
      }
      /* eslint-disable no-undef-init */

      let stack = undefined;
      let inArray = Array.isArray(root);
      let keys = [root];
      let index = -1;
      let edits = [];
      let node = root;
      let key = undefined;
      let parent = undefined;
      const path = [];
      const ancestors = [];
      /* eslint-enable no-undef-init */

      do {
        index++;
        const isLeaving = index === keys.length;
        const isEdited = isLeaving && edits.length !== 0;

        if (isLeaving) {
          key = ancestors.length === 0 ? undefined : path[path.length - 1];
          node = parent;
          parent = ancestors.pop();

          if (isEdited) {
            if (inArray) {
              node = node.slice();
              let editOffset = 0;

              for (const [editKey, editValue] of edits) {
                const arrayKey = editKey - editOffset;

                if (editValue === null) {
                  node.splice(arrayKey, 1);
                  editOffset++;
                } else {
                  node[arrayKey] = editValue;
                }
              }
            } else {
              node = Object.defineProperties(
                {},
                Object.getOwnPropertyDescriptors(node),
              );

              for (const [editKey, editValue] of edits) {
                node[editKey] = editValue;
              }
            }
          }

          index = stack.index;
          keys = stack.keys;
          edits = stack.edits;
          inArray = stack.inArray;
          stack = stack.prev;
        } else if (parent) {
          key = inArray ? index : keys[index];
          node = parent[key];

          if (node === null || node === undefined) {
            continue;
          }

          path.push(key);
        }

        let result;

        if (!Array.isArray(node)) {
          var _enterLeaveMap$get, _enterLeaveMap$get2;

          isNode(node) || devAssert(false, `Invalid AST Node: ${inspect(node)}.`);
          const visitFn = isLeaving
            ? (_enterLeaveMap$get = enterLeaveMap.get(node.kind)) === null ||
              _enterLeaveMap$get === void 0
              ? void 0
              : _enterLeaveMap$get.leave
            : (_enterLeaveMap$get2 = enterLeaveMap.get(node.kind)) === null ||
              _enterLeaveMap$get2 === void 0
            ? void 0
            : _enterLeaveMap$get2.enter;
          result =
            visitFn === null || visitFn === void 0
              ? void 0
              : visitFn.call(visitor, node, key, parent, path, ancestors);

          if (result === BREAK) {
            break;
          }

          if (result === false) {
            if (!isLeaving) {
              path.pop();
              continue;
            }
          } else if (result !== undefined) {
            edits.push([key, result]);

            if (!isLeaving) {
              if (isNode(result)) {
                node = result;
              } else {
                path.pop();
                continue;
              }
            }
          }
        }

        if (result === undefined && isEdited) {
          edits.push([key, node]);
        }

        if (isLeaving) {
          path.pop();
        } else {
          var _node$kind;

          stack = {
            inArray,
            index,
            keys,
            edits,
            prev: stack,
          };
          inArray = Array.isArray(node);
          keys = inArray
            ? node
            : (_node$kind = visitorKeys[node.kind]) !== null &&
              _node$kind !== void 0
            ? _node$kind
            : [];
          index = -1;
          edits = [];

          if (parent) {
            ancestors.push(parent);
          }

          parent = node;
        }
      } while (stack !== undefined);

      if (edits.length !== 0) {
        // New root
        return edits[edits.length - 1][1];
      }

      return root;
    }
    /**
     * Given a visitor instance and a node kind, return EnterLeaveVisitor for that kind.
     */

    function getEnterLeaveForKind(visitor, kind) {
      const kindVisitor = visitor[kind];

      if (typeof kindVisitor === 'object') {
        // { Kind: { enter() {}, leave() {} } }
        return kindVisitor;
      } else if (typeof kindVisitor === 'function') {
        // { Kind() {} }
        return {
          enter: kindVisitor,
          leave: undefined,
        };
      } // { enter() {}, leave() {} }

      return {
        enter: visitor.enter,
        leave: visitor.leave,
      };
    }

    /**
     * Converts an AST into a string, using one set of reasonable
     * formatting rules.
     */

    function print(ast) {
      return visit(ast, printDocASTReducer);
    }
    const MAX_LINE_LENGTH = 80;
    const printDocASTReducer = {
      Name: {
        leave: (node) => node.value,
      },
      Variable: {
        leave: (node) => '$' + node.name,
      },
      // Document
      Document: {
        leave: (node) => join(node.definitions, '\n\n'),
      },
      OperationDefinition: {
        leave(node) {
          const varDefs = wrap$1('(', join(node.variableDefinitions, ', '), ')');
          const prefix = join(
            [
              node.operation,
              join([node.name, varDefs]),
              join(node.directives, ' '),
            ],
            ' ',
          ); // Anonymous queries with no directives or variable definitions can use
          // the query short form.

          return (prefix === 'query' ? '' : prefix + ' ') + node.selectionSet;
        },
      },
      VariableDefinition: {
        leave: ({ variable, type, defaultValue, directives }) =>
          variable +
          ': ' +
          type +
          wrap$1(' = ', defaultValue) +
          wrap$1(' ', join(directives, ' ')),
      },
      SelectionSet: {
        leave: ({ selections }) => block(selections),
      },
      Field: {
        leave({ alias, name, arguments: args, directives, selectionSet }) {
          const prefix = wrap$1('', alias, ': ') + name;
          let argsLine = prefix + wrap$1('(', join(args, ', '), ')');

          if (argsLine.length > MAX_LINE_LENGTH) {
            argsLine = prefix + wrap$1('(\n', indent(join(args, '\n')), '\n)');
          }

          return join([argsLine, join(directives, ' '), selectionSet], ' ');
        },
      },
      Argument: {
        leave: ({ name, value }) => name + ': ' + value,
      },
      // Fragments
      FragmentSpread: {
        leave: ({ name, directives }) =>
          '...' + name + wrap$1(' ', join(directives, ' ')),
      },
      InlineFragment: {
        leave: ({ typeCondition, directives, selectionSet }) =>
          join(
            [
              '...',
              wrap$1('on ', typeCondition),
              join(directives, ' '),
              selectionSet,
            ],
            ' ',
          ),
      },
      FragmentDefinition: {
        leave: (
          { name, typeCondition, variableDefinitions, directives, selectionSet }, // Note: fragment variable definitions are experimental and may be changed
        ) =>
          // or removed in the future.
          `fragment ${name}${wrap$1('(', join(variableDefinitions, ', '), ')')} ` +
          `on ${typeCondition} ${wrap$1('', join(directives, ' '), ' ')}` +
          selectionSet,
      },
      // Value
      IntValue: {
        leave: ({ value }) => value,
      },
      FloatValue: {
        leave: ({ value }) => value,
      },
      StringValue: {
        leave: ({ value, block: isBlockString }) =>
          isBlockString ? printBlockString(value) : printString(value),
      },
      BooleanValue: {
        leave: ({ value }) => (value ? 'true' : 'false'),
      },
      NullValue: {
        leave: () => 'null',
      },
      EnumValue: {
        leave: ({ value }) => value,
      },
      ListValue: {
        leave: ({ values }) => '[' + join(values, ', ') + ']',
      },
      ObjectValue: {
        leave: ({ fields }) => '{' + join(fields, ', ') + '}',
      },
      ObjectField: {
        leave: ({ name, value }) => name + ': ' + value,
      },
      // Directive
      Directive: {
        leave: ({ name, arguments: args }) =>
          '@' + name + wrap$1('(', join(args, ', '), ')'),
      },
      // Type
      NamedType: {
        leave: ({ name }) => name,
      },
      ListType: {
        leave: ({ type }) => '[' + type + ']',
      },
      NonNullType: {
        leave: ({ type }) => type + '!',
      },
      // Type System Definitions
      SchemaDefinition: {
        leave: ({ description, directives, operationTypes }) =>
          wrap$1('', description, '\n') +
          join(['schema', join(directives, ' '), block(operationTypes)], ' '),
      },
      OperationTypeDefinition: {
        leave: ({ operation, type }) => operation + ': ' + type,
      },
      ScalarTypeDefinition: {
        leave: ({ description, name, directives }) =>
          wrap$1('', description, '\n') +
          join(['scalar', name, join(directives, ' ')], ' '),
      },
      ObjectTypeDefinition: {
        leave: ({ description, name, interfaces, directives, fields }) =>
          wrap$1('', description, '\n') +
          join(
            [
              'type',
              name,
              wrap$1('implements ', join(interfaces, ' & ')),
              join(directives, ' '),
              block(fields),
            ],
            ' ',
          ),
      },
      FieldDefinition: {
        leave: ({ description, name, arguments: args, type, directives }) =>
          wrap$1('', description, '\n') +
          name +
          (hasMultilineItems(args)
            ? wrap$1('(\n', indent(join(args, '\n')), '\n)')
            : wrap$1('(', join(args, ', '), ')')) +
          ': ' +
          type +
          wrap$1(' ', join(directives, ' ')),
      },
      InputValueDefinition: {
        leave: ({ description, name, type, defaultValue, directives }) =>
          wrap$1('', description, '\n') +
          join(
            [name + ': ' + type, wrap$1('= ', defaultValue), join(directives, ' ')],
            ' ',
          ),
      },
      InterfaceTypeDefinition: {
        leave: ({ description, name, interfaces, directives, fields }) =>
          wrap$1('', description, '\n') +
          join(
            [
              'interface',
              name,
              wrap$1('implements ', join(interfaces, ' & ')),
              join(directives, ' '),
              block(fields),
            ],
            ' ',
          ),
      },
      UnionTypeDefinition: {
        leave: ({ description, name, directives, types }) =>
          wrap$1('', description, '\n') +
          join(
            ['union', name, join(directives, ' '), wrap$1('= ', join(types, ' | '))],
            ' ',
          ),
      },
      EnumTypeDefinition: {
        leave: ({ description, name, directives, values }) =>
          wrap$1('', description, '\n') +
          join(['enum', name, join(directives, ' '), block(values)], ' '),
      },
      EnumValueDefinition: {
        leave: ({ description, name, directives }) =>
          wrap$1('', description, '\n') + join([name, join(directives, ' ')], ' '),
      },
      InputObjectTypeDefinition: {
        leave: ({ description, name, directives, fields }) =>
          wrap$1('', description, '\n') +
          join(['input', name, join(directives, ' '), block(fields)], ' '),
      },
      DirectiveDefinition: {
        leave: ({ description, name, arguments: args, repeatable, locations }) =>
          wrap$1('', description, '\n') +
          'directive @' +
          name +
          (hasMultilineItems(args)
            ? wrap$1('(\n', indent(join(args, '\n')), '\n)')
            : wrap$1('(', join(args, ', '), ')')) +
          (repeatable ? ' repeatable' : '') +
          ' on ' +
          join(locations, ' | '),
      },
      SchemaExtension: {
        leave: ({ directives, operationTypes }) =>
          join(
            ['extend schema', join(directives, ' '), block(operationTypes)],
            ' ',
          ),
      },
      ScalarTypeExtension: {
        leave: ({ name, directives }) =>
          join(['extend scalar', name, join(directives, ' ')], ' '),
      },
      ObjectTypeExtension: {
        leave: ({ name, interfaces, directives, fields }) =>
          join(
            [
              'extend type',
              name,
              wrap$1('implements ', join(interfaces, ' & ')),
              join(directives, ' '),
              block(fields),
            ],
            ' ',
          ),
      },
      InterfaceTypeExtension: {
        leave: ({ name, interfaces, directives, fields }) =>
          join(
            [
              'extend interface',
              name,
              wrap$1('implements ', join(interfaces, ' & ')),
              join(directives, ' '),
              block(fields),
            ],
            ' ',
          ),
      },
      UnionTypeExtension: {
        leave: ({ name, directives, types }) =>
          join(
            [
              'extend union',
              name,
              join(directives, ' '),
              wrap$1('= ', join(types, ' | ')),
            ],
            ' ',
          ),
      },
      EnumTypeExtension: {
        leave: ({ name, directives, values }) =>
          join(['extend enum', name, join(directives, ' '), block(values)], ' '),
      },
      InputObjectTypeExtension: {
        leave: ({ name, directives, fields }) =>
          join(['extend input', name, join(directives, ' '), block(fields)], ' '),
      },
    };
    /**
     * Given maybeArray, print an empty string if it is null or empty, otherwise
     * print all items together separated by separator if provided
     */

    function join(maybeArray, separator = '') {
      var _maybeArray$filter$jo;

      return (_maybeArray$filter$jo =
        maybeArray === null || maybeArray === void 0
          ? void 0
          : maybeArray.filter((x) => x).join(separator)) !== null &&
        _maybeArray$filter$jo !== void 0
        ? _maybeArray$filter$jo
        : '';
    }
    /**
     * Given array, print each item on its own line, wrapped in an indented `{ }` block.
     */

    function block(array) {
      return wrap$1('{\n', indent(join(array, '\n')), '\n}');
    }
    /**
     * If maybeString is not null or empty, then wrap with start and end, otherwise print an empty string.
     */

    function wrap$1(start, maybeString, end = '') {
      return maybeString != null && maybeString !== ''
        ? start + maybeString + end
        : '';
    }

    function indent(str) {
      return wrap$1('  ', str.replace(/\n/g, '\n  '));
    }

    function hasMultilineItems(maybeArray) {
      var _maybeArray$some;

      // FIXME: https://github.com/graphql/graphql-js/issues/2203

      /* c8 ignore next */
      return (_maybeArray$some =
        maybeArray === null || maybeArray === void 0
          ? void 0
          : maybeArray.some((str) => str.includes('\n'))) !== null &&
        _maybeArray$some !== void 0
        ? _maybeArray$some
        : false;
    }

    function removeTemporaryGlobals() {
        return typeof Source === "function" ? remove() : remove();
    }

    function checkDEV() {
        __DEV__ ? invariant$1("boolean" === typeof DEV, DEV) : invariant$1("boolean" === typeof DEV, 36);
    }
    removeTemporaryGlobals();
    checkDEV();

    function shouldInclude(_a, variables) {
        var directives = _a.directives;
        if (!directives || !directives.length) {
            return true;
        }
        return getInclusionDirectives(directives).every(function (_a) {
            var directive = _a.directive, ifArgument = _a.ifArgument;
            var evaledValue = false;
            if (ifArgument.value.kind === 'Variable') {
                evaledValue = variables && variables[ifArgument.value.name.value];
                __DEV__ ? invariant$1(evaledValue !== void 0, "Invalid variable referenced in @".concat(directive.name.value, " directive.")) : invariant$1(evaledValue !== void 0, 37);
            }
            else {
                evaledValue = ifArgument.value.value;
            }
            return directive.name.value === 'skip' ? !evaledValue : evaledValue;
        });
    }
    function getDirectiveNames(root) {
        var names = [];
        visit(root, {
            Directive: function (node) {
                names.push(node.name.value);
            },
        });
        return names;
    }
    function hasDirectives(names, root) {
        return getDirectiveNames(root).some(function (name) { return names.indexOf(name) > -1; });
    }
    function hasClientExports(document) {
        return (document &&
            hasDirectives(['client'], document) &&
            hasDirectives(['export'], document));
    }
    function isInclusionDirective(_a) {
        var value = _a.name.value;
        return value === 'skip' || value === 'include';
    }
    function getInclusionDirectives(directives) {
        var result = [];
        if (directives && directives.length) {
            directives.forEach(function (directive) {
                if (!isInclusionDirective(directive))
                    return;
                var directiveArguments = directive.arguments;
                var directiveName = directive.name.value;
                __DEV__ ? invariant$1(directiveArguments && directiveArguments.length === 1, "Incorrect number of arguments for the @".concat(directiveName, " directive.")) : invariant$1(directiveArguments && directiveArguments.length === 1, 38);
                var ifArgument = directiveArguments[0];
                __DEV__ ? invariant$1(ifArgument.name && ifArgument.name.value === 'if', "Invalid argument for the @".concat(directiveName, " directive.")) : invariant$1(ifArgument.name && ifArgument.name.value === 'if', 39);
                var ifValue = ifArgument.value;
                __DEV__ ? invariant$1(ifValue &&
                    (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), "Argument for the @".concat(directiveName, " directive must be a variable or a boolean value.")) : invariant$1(ifValue &&
                    (ifValue.kind === 'Variable' || ifValue.kind === 'BooleanValue'), 40);
                result.push({ directive: directive, ifArgument: ifArgument });
            });
        }
        return result;
    }

    function getFragmentQueryDocument(document, fragmentName) {
        var actualFragmentName = fragmentName;
        var fragments = [];
        document.definitions.forEach(function (definition) {
            if (definition.kind === 'OperationDefinition') {
                throw __DEV__ ? new InvariantError("Found a ".concat(definition.operation, " operation").concat(definition.name ? " named '".concat(definition.name.value, "'") : '', ". ") +
                    'No operations are allowed when using a fragment as a query. Only fragments are allowed.') : new InvariantError(41);
            }
            if (definition.kind === 'FragmentDefinition') {
                fragments.push(definition);
            }
        });
        if (typeof actualFragmentName === 'undefined') {
            __DEV__ ? invariant$1(fragments.length === 1, "Found ".concat(fragments.length, " fragments. `fragmentName` must be provided when there is not exactly 1 fragment.")) : invariant$1(fragments.length === 1, 42);
            actualFragmentName = fragments[0].name.value;
        }
        var query = __assign(__assign({}, document), { definitions: __spreadArray([
                {
                    kind: 'OperationDefinition',
                    operation: 'query',
                    selectionSet: {
                        kind: 'SelectionSet',
                        selections: [
                            {
                                kind: 'FragmentSpread',
                                name: {
                                    kind: 'Name',
                                    value: actualFragmentName,
                                },
                            },
                        ],
                    },
                }
            ], document.definitions, true) });
        return query;
    }
    function createFragmentMap(fragments) {
        if (fragments === void 0) { fragments = []; }
        var symTable = {};
        fragments.forEach(function (fragment) {
            symTable[fragment.name.value] = fragment;
        });
        return symTable;
    }
    function getFragmentFromSelection(selection, fragmentMap) {
        switch (selection.kind) {
            case 'InlineFragment':
                return selection;
            case 'FragmentSpread': {
                var fragment = fragmentMap && fragmentMap[selection.name.value];
                __DEV__ ? invariant$1(fragment, "No fragment named ".concat(selection.name.value, ".")) : invariant$1(fragment, 43);
                return fragment;
            }
            default:
                return null;
        }
    }

    function isNonNullObject(obj) {
        return obj !== null && typeof obj === 'object';
    }

    function makeReference(id) {
        return { __ref: String(id) };
    }
    function isReference(obj) {
        return Boolean(obj && typeof obj === 'object' && typeof obj.__ref === 'string');
    }
    function isDocumentNode(value) {
        return (isNonNullObject(value) &&
            value.kind === "Document" &&
            Array.isArray(value.definitions));
    }
    function isStringValue(value) {
        return value.kind === 'StringValue';
    }
    function isBooleanValue(value) {
        return value.kind === 'BooleanValue';
    }
    function isIntValue(value) {
        return value.kind === 'IntValue';
    }
    function isFloatValue(value) {
        return value.kind === 'FloatValue';
    }
    function isVariable(value) {
        return value.kind === 'Variable';
    }
    function isObjectValue(value) {
        return value.kind === 'ObjectValue';
    }
    function isListValue(value) {
        return value.kind === 'ListValue';
    }
    function isEnumValue(value) {
        return value.kind === 'EnumValue';
    }
    function isNullValue(value) {
        return value.kind === 'NullValue';
    }
    function valueToObjectRepresentation(argObj, name, value, variables) {
        if (isIntValue(value) || isFloatValue(value)) {
            argObj[name.value] = Number(value.value);
        }
        else if (isBooleanValue(value) || isStringValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isObjectValue(value)) {
            var nestedArgObj_1 = {};
            value.fields.map(function (obj) {
                return valueToObjectRepresentation(nestedArgObj_1, obj.name, obj.value, variables);
            });
            argObj[name.value] = nestedArgObj_1;
        }
        else if (isVariable(value)) {
            var variableValue = (variables || {})[value.name.value];
            argObj[name.value] = variableValue;
        }
        else if (isListValue(value)) {
            argObj[name.value] = value.values.map(function (listValue) {
                var nestedArgArrayObj = {};
                valueToObjectRepresentation(nestedArgArrayObj, name, listValue, variables);
                return nestedArgArrayObj[name.value];
            });
        }
        else if (isEnumValue(value)) {
            argObj[name.value] = value.value;
        }
        else if (isNullValue(value)) {
            argObj[name.value] = null;
        }
        else {
            throw __DEV__ ? new InvariantError("The inline argument \"".concat(name.value, "\" of kind \"").concat(value.kind, "\"") +
                'is not supported. Use variables instead of inline arguments to ' +
                'overcome this limitation.') : new InvariantError(52);
        }
    }
    function storeKeyNameFromField(field, variables) {
        var directivesObj = null;
        if (field.directives) {
            directivesObj = {};
            field.directives.forEach(function (directive) {
                directivesObj[directive.name.value] = {};
                if (directive.arguments) {
                    directive.arguments.forEach(function (_a) {
                        var name = _a.name, value = _a.value;
                        return valueToObjectRepresentation(directivesObj[directive.name.value], name, value, variables);
                    });
                }
            });
        }
        var argObj = null;
        if (field.arguments && field.arguments.length) {
            argObj = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj, name, value, variables);
            });
        }
        return getStoreKeyName(field.name.value, argObj, directivesObj);
    }
    var KNOWN_DIRECTIVES = [
        'connection',
        'include',
        'skip',
        'client',
        'rest',
        'export',
    ];
    var getStoreKeyName = Object.assign(function (fieldName, args, directives) {
        if (args &&
            directives &&
            directives['connection'] &&
            directives['connection']['key']) {
            if (directives['connection']['filter'] &&
                directives['connection']['filter'].length > 0) {
                var filterKeys = directives['connection']['filter']
                    ? directives['connection']['filter']
                    : [];
                filterKeys.sort();
                var filteredArgs_1 = {};
                filterKeys.forEach(function (key) {
                    filteredArgs_1[key] = args[key];
                });
                return "".concat(directives['connection']['key'], "(").concat(stringify(filteredArgs_1), ")");
            }
            else {
                return directives['connection']['key'];
            }
        }
        var completeFieldName = fieldName;
        if (args) {
            var stringifiedArgs = stringify(args);
            completeFieldName += "(".concat(stringifiedArgs, ")");
        }
        if (directives) {
            Object.keys(directives).forEach(function (key) {
                if (KNOWN_DIRECTIVES.indexOf(key) !== -1)
                    return;
                if (directives[key] && Object.keys(directives[key]).length) {
                    completeFieldName += "@".concat(key, "(").concat(stringify(directives[key]), ")");
                }
                else {
                    completeFieldName += "@".concat(key);
                }
            });
        }
        return completeFieldName;
    }, {
        setStringify: function (s) {
            var previous = stringify;
            stringify = s;
            return previous;
        },
    });
    var stringify = function defaultStringify(value) {
        return JSON.stringify(value, stringifyReplacer);
    };
    function stringifyReplacer(_key, value) {
        if (isNonNullObject(value) && !Array.isArray(value)) {
            value = Object.keys(value).sort().reduce(function (copy, key) {
                copy[key] = value[key];
                return copy;
            }, {});
        }
        return value;
    }
    function argumentsObjectFromField(field, variables) {
        if (field.arguments && field.arguments.length) {
            var argObj_1 = {};
            field.arguments.forEach(function (_a) {
                var name = _a.name, value = _a.value;
                return valueToObjectRepresentation(argObj_1, name, value, variables);
            });
            return argObj_1;
        }
        return null;
    }
    function resultKeyNameFromField(field) {
        return field.alias ? field.alias.value : field.name.value;
    }
    function getTypenameFromResult(result, selectionSet, fragmentMap) {
        if (typeof result.__typename === 'string') {
            return result.__typename;
        }
        for (var _i = 0, _a = selectionSet.selections; _i < _a.length; _i++) {
            var selection = _a[_i];
            if (isField(selection)) {
                if (selection.name.value === '__typename') {
                    return result[resultKeyNameFromField(selection)];
                }
            }
            else {
                var typename = getTypenameFromResult(result, getFragmentFromSelection(selection, fragmentMap).selectionSet, fragmentMap);
                if (typeof typename === 'string') {
                    return typename;
                }
            }
        }
    }
    function isField(selection) {
        return selection.kind === 'Field';
    }
    function isInlineFragment(selection) {
        return selection.kind === 'InlineFragment';
    }

    function checkDocument(doc) {
        __DEV__ ? invariant$1(doc && doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql") : invariant$1(doc && doc.kind === 'Document', 44);
        var operations = doc.definitions
            .filter(function (d) { return d.kind !== 'FragmentDefinition'; })
            .map(function (definition) {
            if (definition.kind !== 'OperationDefinition') {
                throw __DEV__ ? new InvariantError("Schema type definitions not allowed in queries. Found: \"".concat(definition.kind, "\"")) : new InvariantError(45);
            }
            return definition;
        });
        __DEV__ ? invariant$1(operations.length <= 1, "Ambiguous GraphQL document: contains ".concat(operations.length, " operations")) : invariant$1(operations.length <= 1, 46);
        return doc;
    }
    function getOperationDefinition(doc) {
        checkDocument(doc);
        return doc.definitions.filter(function (definition) { return definition.kind === 'OperationDefinition'; })[0];
    }
    function getOperationName(doc) {
        return (doc.definitions
            .filter(function (definition) {
            return definition.kind === 'OperationDefinition' && definition.name;
        })
            .map(function (x) { return x.name.value; })[0] || null);
    }
    function getFragmentDefinitions(doc) {
        return doc.definitions.filter(function (definition) { return definition.kind === 'FragmentDefinition'; });
    }
    function getQueryDefinition(doc) {
        var queryDef = getOperationDefinition(doc);
        __DEV__ ? invariant$1(queryDef && queryDef.operation === 'query', 'Must contain a query definition.') : invariant$1(queryDef && queryDef.operation === 'query', 47);
        return queryDef;
    }
    function getFragmentDefinition(doc) {
        __DEV__ ? invariant$1(doc.kind === 'Document', "Expecting a parsed GraphQL document. Perhaps you need to wrap the query string in a \"gql\" tag? http://docs.apollostack.com/apollo-client/core.html#gql") : invariant$1(doc.kind === 'Document', 48);
        __DEV__ ? invariant$1(doc.definitions.length <= 1, 'Fragment must have exactly one definition.') : invariant$1(doc.definitions.length <= 1, 49);
        var fragmentDef = doc.definitions[0];
        __DEV__ ? invariant$1(fragmentDef.kind === 'FragmentDefinition', 'Must be a fragment definition.') : invariant$1(fragmentDef.kind === 'FragmentDefinition', 50);
        return fragmentDef;
    }
    function getMainDefinition(queryDoc) {
        checkDocument(queryDoc);
        var fragmentDefinition;
        for (var _i = 0, _a = queryDoc.definitions; _i < _a.length; _i++) {
            var definition = _a[_i];
            if (definition.kind === 'OperationDefinition') {
                var operation = definition.operation;
                if (operation === 'query' ||
                    operation === 'mutation' ||
                    operation === 'subscription') {
                    return definition;
                }
            }
            if (definition.kind === 'FragmentDefinition' && !fragmentDefinition) {
                fragmentDefinition = definition;
            }
        }
        if (fragmentDefinition) {
            return fragmentDefinition;
        }
        throw __DEV__ ? new InvariantError('Expected a parsed GraphQL query with a query, mutation, subscription, or a fragment.') : new InvariantError(51);
    }
    function getDefaultValues(definition) {
        var defaultValues = Object.create(null);
        var defs = definition && definition.variableDefinitions;
        if (defs && defs.length) {
            defs.forEach(function (def) {
                if (def.defaultValue) {
                    valueToObjectRepresentation(defaultValues, def.variable.name, def.defaultValue);
                }
            });
        }
        return defaultValues;
    }

    function filterInPlace(array, test, context) {
        var target = 0;
        array.forEach(function (elem, i) {
            if (test.call(this, elem, i, array)) {
                array[target++] = elem;
            }
        }, context);
        array.length = target;
        return array;
    }

    var TYPENAME_FIELD = {
        kind: 'Field',
        name: {
            kind: 'Name',
            value: '__typename',
        },
    };
    function isEmpty(op, fragments) {
        return op.selectionSet.selections.every(function (selection) {
            return selection.kind === 'FragmentSpread' &&
                isEmpty(fragments[selection.name.value], fragments);
        });
    }
    function nullIfDocIsEmpty(doc) {
        return isEmpty(getOperationDefinition(doc) || getFragmentDefinition(doc), createFragmentMap(getFragmentDefinitions(doc)))
            ? null
            : doc;
    }
    function getDirectiveMatcher(directives) {
        return function directiveMatcher(directive) {
            return directives.some(function (dir) {
                return (dir.name && dir.name === directive.name.value) ||
                    (dir.test && dir.test(directive));
            });
        };
    }
    function removeDirectivesFromDocument(directives, doc) {
        var variablesInUse = Object.create(null);
        var variablesToRemove = [];
        var fragmentSpreadsInUse = Object.create(null);
        var fragmentSpreadsToRemove = [];
        var modifiedDoc = nullIfDocIsEmpty(visit(doc, {
            Variable: {
                enter: function (node, _key, parent) {
                    if (parent.kind !== 'VariableDefinition') {
                        variablesInUse[node.name.value] = true;
                    }
                },
            },
            Field: {
                enter: function (node) {
                    if (directives && node.directives) {
                        var shouldRemoveField = directives.some(function (directive) { return directive.remove; });
                        if (shouldRemoveField &&
                            node.directives &&
                            node.directives.some(getDirectiveMatcher(directives))) {
                            if (node.arguments) {
                                node.arguments.forEach(function (arg) {
                                    if (arg.value.kind === 'Variable') {
                                        variablesToRemove.push({
                                            name: arg.value.name.value,
                                        });
                                    }
                                });
                            }
                            if (node.selectionSet) {
                                getAllFragmentSpreadsFromSelectionSet(node.selectionSet).forEach(function (frag) {
                                    fragmentSpreadsToRemove.push({
                                        name: frag.name.value,
                                    });
                                });
                            }
                            return null;
                        }
                    }
                },
            },
            FragmentSpread: {
                enter: function (node) {
                    fragmentSpreadsInUse[node.name.value] = true;
                },
            },
            Directive: {
                enter: function (node) {
                    if (getDirectiveMatcher(directives)(node)) {
                        return null;
                    }
                },
            },
        }));
        if (modifiedDoc &&
            filterInPlace(variablesToRemove, function (v) { return !!v.name && !variablesInUse[v.name]; }).length) {
            modifiedDoc = removeArgumentsFromDocument(variablesToRemove, modifiedDoc);
        }
        if (modifiedDoc &&
            filterInPlace(fragmentSpreadsToRemove, function (fs) { return !!fs.name && !fragmentSpreadsInUse[fs.name]; })
                .length) {
            modifiedDoc = removeFragmentSpreadFromDocument(fragmentSpreadsToRemove, modifiedDoc);
        }
        return modifiedDoc;
    }
    var addTypenameToDocument = Object.assign(function (doc) {
        return visit(doc, {
            SelectionSet: {
                enter: function (node, _key, parent) {
                    if (parent &&
                        parent.kind === 'OperationDefinition') {
                        return;
                    }
                    var selections = node.selections;
                    if (!selections) {
                        return;
                    }
                    var skip = selections.some(function (selection) {
                        return (isField(selection) &&
                            (selection.name.value === '__typename' ||
                                selection.name.value.lastIndexOf('__', 0) === 0));
                    });
                    if (skip) {
                        return;
                    }
                    var field = parent;
                    if (isField(field) &&
                        field.directives &&
                        field.directives.some(function (d) { return d.name.value === 'export'; })) {
                        return;
                    }
                    return __assign(__assign({}, node), { selections: __spreadArray(__spreadArray([], selections, true), [TYPENAME_FIELD], false) });
                },
            },
        });
    }, {
        added: function (field) {
            return field === TYPENAME_FIELD;
        },
    });
    var connectionRemoveConfig = {
        test: function (directive) {
            var willRemove = directive.name.value === 'connection';
            if (willRemove) {
                if (!directive.arguments ||
                    !directive.arguments.some(function (arg) { return arg.name.value === 'key'; })) {
                    __DEV__ && invariant$1.warn('Removing an @connection directive even though it does not have a key. ' +
                        'You may want to use the key parameter to specify a store key.');
                }
            }
            return willRemove;
        },
    };
    function removeConnectionDirectiveFromDocument(doc) {
        return removeDirectivesFromDocument([connectionRemoveConfig], checkDocument(doc));
    }
    function getArgumentMatcher(config) {
        return function argumentMatcher(argument) {
            return config.some(function (aConfig) {
                return argument.value &&
                    argument.value.kind === 'Variable' &&
                    argument.value.name &&
                    (aConfig.name === argument.value.name.value ||
                        (aConfig.test && aConfig.test(argument)));
            });
        };
    }
    function removeArgumentsFromDocument(config, doc) {
        var argMatcher = getArgumentMatcher(config);
        return nullIfDocIsEmpty(visit(doc, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign(__assign({}, node), { variableDefinitions: node.variableDefinitions ? node.variableDefinitions.filter(function (varDef) {
                            return !config.some(function (arg) { return arg.name === varDef.variable.name.value; });
                        }) : [] });
                },
            },
            Field: {
                enter: function (node) {
                    var shouldRemoveField = config.some(function (argConfig) { return argConfig.remove; });
                    if (shouldRemoveField) {
                        var argMatchCount_1 = 0;
                        if (node.arguments) {
                            node.arguments.forEach(function (arg) {
                                if (argMatcher(arg)) {
                                    argMatchCount_1 += 1;
                                }
                            });
                        }
                        if (argMatchCount_1 === 1) {
                            return null;
                        }
                    }
                },
            },
            Argument: {
                enter: function (node) {
                    if (argMatcher(node)) {
                        return null;
                    }
                },
            },
        }));
    }
    function removeFragmentSpreadFromDocument(config, doc) {
        function enter(node) {
            if (config.some(function (def) { return def.name === node.name.value; })) {
                return null;
            }
        }
        return nullIfDocIsEmpty(visit(doc, {
            FragmentSpread: { enter: enter },
            FragmentDefinition: { enter: enter },
        }));
    }
    function getAllFragmentSpreadsFromSelectionSet(selectionSet) {
        var allFragments = [];
        selectionSet.selections.forEach(function (selection) {
            if ((isField(selection) || isInlineFragment(selection)) &&
                selection.selectionSet) {
                getAllFragmentSpreadsFromSelectionSet(selection.selectionSet).forEach(function (frag) { return allFragments.push(frag); });
            }
            else if (selection.kind === 'FragmentSpread') {
                allFragments.push(selection);
            }
        });
        return allFragments;
    }
    function buildQueryFromSelectionSet(document) {
        var definition = getMainDefinition(document);
        var definitionOperation = definition.operation;
        if (definitionOperation === 'query') {
            return document;
        }
        var modifiedDoc = visit(document, {
            OperationDefinition: {
                enter: function (node) {
                    return __assign(__assign({}, node), { operation: 'query' });
                },
            },
        });
        return modifiedDoc;
    }
    function removeClientSetsFromDocument(document) {
        checkDocument(document);
        var modifiedDoc = removeDirectivesFromDocument([
            {
                test: function (directive) { return directive.name.value === 'client'; },
                remove: true,
            },
        ], document);
        if (modifiedDoc) {
            modifiedDoc = visit(modifiedDoc, {
                FragmentDefinition: {
                    enter: function (node) {
                        if (node.selectionSet) {
                            var isTypenameOnly = node.selectionSet.selections.every(function (selection) {
                                return isField(selection) && selection.name.value === '__typename';
                            });
                            if (isTypenameOnly) {
                                return null;
                            }
                        }
                    },
                },
            });
        }
        return modifiedDoc;
    }

    var hasOwnProperty$5 = Object.prototype.hasOwnProperty;
    function mergeDeep() {
        var sources = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            sources[_i] = arguments[_i];
        }
        return mergeDeepArray(sources);
    }
    function mergeDeepArray(sources) {
        var target = sources[0] || {};
        var count = sources.length;
        if (count > 1) {
            var merger = new DeepMerger();
            for (var i = 1; i < count; ++i) {
                target = merger.merge(target, sources[i]);
            }
        }
        return target;
    }
    var defaultReconciler = function (target, source, property) {
        return this.merge(target[property], source[property]);
    };
    var DeepMerger = (function () {
        function DeepMerger(reconciler) {
            if (reconciler === void 0) { reconciler = defaultReconciler; }
            this.reconciler = reconciler;
            this.isObject = isNonNullObject;
            this.pastCopies = new Set();
        }
        DeepMerger.prototype.merge = function (target, source) {
            var _this = this;
            var context = [];
            for (var _i = 2; _i < arguments.length; _i++) {
                context[_i - 2] = arguments[_i];
            }
            if (isNonNullObject(source) && isNonNullObject(target)) {
                Object.keys(source).forEach(function (sourceKey) {
                    if (hasOwnProperty$5.call(target, sourceKey)) {
                        var targetValue = target[sourceKey];
                        if (source[sourceKey] !== targetValue) {
                            var result = _this.reconciler.apply(_this, __spreadArray([target, source, sourceKey], context, false));
                            if (result !== targetValue) {
                                target = _this.shallowCopyForMerge(target);
                                target[sourceKey] = result;
                            }
                        }
                    }
                    else {
                        target = _this.shallowCopyForMerge(target);
                        target[sourceKey] = source[sourceKey];
                    }
                });
                return target;
            }
            return source;
        };
        DeepMerger.prototype.shallowCopyForMerge = function (value) {
            if (isNonNullObject(value)) {
                if (this.pastCopies.has(value)) {
                    if (!Object.isFrozen(value))
                        return value;
                    this.pastCopies.delete(value);
                }
                if (Array.isArray(value)) {
                    value = value.slice(0);
                }
                else {
                    value = __assign({ __proto__: Object.getPrototypeOf(value) }, value);
                }
                this.pastCopies.add(value);
            }
            return value;
        };
        return DeepMerger;
    }());

    function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (it) return (it = it.call(o)).next.bind(it); if (Array.isArray(o) || (it = _unsupportedIterableToArray$1(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

    function _unsupportedIterableToArray$1(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray$1(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray$1(o, minLen); }

    function _arrayLikeToArray$1(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

    function _defineProperties$1(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

    function _createClass$1(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties$1(Constructor.prototype, protoProps); if (staticProps) _defineProperties$1(Constructor, staticProps); return Constructor; }

    // === Symbol Support ===
    var hasSymbols = function () {
      return typeof Symbol === 'function';
    };

    var hasSymbol = function (name) {
      return hasSymbols() && Boolean(Symbol[name]);
    };

    var getSymbol = function (name) {
      return hasSymbol(name) ? Symbol[name] : '@@' + name;
    };

    if (hasSymbols() && !hasSymbol('observable')) {
      Symbol.observable = Symbol('observable');
    }

    var SymbolIterator = getSymbol('iterator');
    var SymbolObservable = getSymbol('observable');
    var SymbolSpecies = getSymbol('species'); // === Abstract Operations ===

    function getMethod(obj, key) {
      var value = obj[key];
      if (value == null) return undefined;
      if (typeof value !== 'function') throw new TypeError(value + ' is not a function');
      return value;
    }

    function getSpecies(obj) {
      var ctor = obj.constructor;

      if (ctor !== undefined) {
        ctor = ctor[SymbolSpecies];

        if (ctor === null) {
          ctor = undefined;
        }
      }

      return ctor !== undefined ? ctor : Observable;
    }

    function isObservable(x) {
      return x instanceof Observable; // SPEC: Brand check
    }

    function hostReportError(e) {
      if (hostReportError.log) {
        hostReportError.log(e);
      } else {
        setTimeout(function () {
          throw e;
        });
      }
    }

    function enqueue(fn) {
      Promise.resolve().then(function () {
        try {
          fn();
        } catch (e) {
          hostReportError(e);
        }
      });
    }

    function cleanupSubscription(subscription) {
      var cleanup = subscription._cleanup;
      if (cleanup === undefined) return;
      subscription._cleanup = undefined;

      if (!cleanup) {
        return;
      }

      try {
        if (typeof cleanup === 'function') {
          cleanup();
        } else {
          var unsubscribe = getMethod(cleanup, 'unsubscribe');

          if (unsubscribe) {
            unsubscribe.call(cleanup);
          }
        }
      } catch (e) {
        hostReportError(e);
      }
    }

    function closeSubscription(subscription) {
      subscription._observer = undefined;
      subscription._queue = undefined;
      subscription._state = 'closed';
    }

    function flushSubscription(subscription) {
      var queue = subscription._queue;

      if (!queue) {
        return;
      }

      subscription._queue = undefined;
      subscription._state = 'ready';

      for (var i = 0; i < queue.length; ++i) {
        notifySubscription(subscription, queue[i].type, queue[i].value);
        if (subscription._state === 'closed') break;
      }
    }

    function notifySubscription(subscription, type, value) {
      subscription._state = 'running';
      var observer = subscription._observer;

      try {
        var m = getMethod(observer, type);

        switch (type) {
          case 'next':
            if (m) m.call(observer, value);
            break;

          case 'error':
            closeSubscription(subscription);
            if (m) m.call(observer, value);else throw value;
            break;

          case 'complete':
            closeSubscription(subscription);
            if (m) m.call(observer);
            break;
        }
      } catch (e) {
        hostReportError(e);
      }

      if (subscription._state === 'closed') cleanupSubscription(subscription);else if (subscription._state === 'running') subscription._state = 'ready';
    }

    function onNotify(subscription, type, value) {
      if (subscription._state === 'closed') return;

      if (subscription._state === 'buffering') {
        subscription._queue.push({
          type: type,
          value: value
        });

        return;
      }

      if (subscription._state !== 'ready') {
        subscription._state = 'buffering';
        subscription._queue = [{
          type: type,
          value: value
        }];
        enqueue(function () {
          return flushSubscription(subscription);
        });
        return;
      }

      notifySubscription(subscription, type, value);
    }

    var Subscription = /*#__PURE__*/function () {
      function Subscription(observer, subscriber) {
        // ASSERT: observer is an object
        // ASSERT: subscriber is callable
        this._cleanup = undefined;
        this._observer = observer;
        this._queue = undefined;
        this._state = 'initializing';
        var subscriptionObserver = new SubscriptionObserver(this);

        try {
          this._cleanup = subscriber.call(undefined, subscriptionObserver);
        } catch (e) {
          subscriptionObserver.error(e);
        }

        if (this._state === 'initializing') this._state = 'ready';
      }

      var _proto = Subscription.prototype;

      _proto.unsubscribe = function unsubscribe() {
        if (this._state !== 'closed') {
          closeSubscription(this);
          cleanupSubscription(this);
        }
      };

      _createClass$1(Subscription, [{
        key: "closed",
        get: function () {
          return this._state === 'closed';
        }
      }]);

      return Subscription;
    }();

    var SubscriptionObserver = /*#__PURE__*/function () {
      function SubscriptionObserver(subscription) {
        this._subscription = subscription;
      }

      var _proto2 = SubscriptionObserver.prototype;

      _proto2.next = function next(value) {
        onNotify(this._subscription, 'next', value);
      };

      _proto2.error = function error(value) {
        onNotify(this._subscription, 'error', value);
      };

      _proto2.complete = function complete() {
        onNotify(this._subscription, 'complete');
      };

      _createClass$1(SubscriptionObserver, [{
        key: "closed",
        get: function () {
          return this._subscription._state === 'closed';
        }
      }]);

      return SubscriptionObserver;
    }();

    var Observable = /*#__PURE__*/function () {
      function Observable(subscriber) {
        if (!(this instanceof Observable)) throw new TypeError('Observable cannot be called as a function');
        if (typeof subscriber !== 'function') throw new TypeError('Observable initializer must be a function');
        this._subscriber = subscriber;
      }

      var _proto3 = Observable.prototype;

      _proto3.subscribe = function subscribe(observer) {
        if (typeof observer !== 'object' || observer === null) {
          observer = {
            next: observer,
            error: arguments[1],
            complete: arguments[2]
          };
        }

        return new Subscription(observer, this._subscriber);
      };

      _proto3.forEach = function forEach(fn) {
        var _this = this;

        return new Promise(function (resolve, reject) {
          if (typeof fn !== 'function') {
            reject(new TypeError(fn + ' is not a function'));
            return;
          }

          function done() {
            subscription.unsubscribe();
            resolve();
          }

          var subscription = _this.subscribe({
            next: function (value) {
              try {
                fn(value, done);
              } catch (e) {
                reject(e);
                subscription.unsubscribe();
              }
            },
            error: reject,
            complete: resolve
          });
        });
      };

      _proto3.map = function map(fn) {
        var _this2 = this;

        if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
        var C = getSpecies(this);
        return new C(function (observer) {
          return _this2.subscribe({
            next: function (value) {
              try {
                value = fn(value);
              } catch (e) {
                return observer.error(e);
              }

              observer.next(value);
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              observer.complete();
            }
          });
        });
      };

      _proto3.filter = function filter(fn) {
        var _this3 = this;

        if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
        var C = getSpecies(this);
        return new C(function (observer) {
          return _this3.subscribe({
            next: function (value) {
              try {
                if (!fn(value)) return;
              } catch (e) {
                return observer.error(e);
              }

              observer.next(value);
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              observer.complete();
            }
          });
        });
      };

      _proto3.reduce = function reduce(fn) {
        var _this4 = this;

        if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
        var C = getSpecies(this);
        var hasSeed = arguments.length > 1;
        var hasValue = false;
        var seed = arguments[1];
        var acc = seed;
        return new C(function (observer) {
          return _this4.subscribe({
            next: function (value) {
              var first = !hasValue;
              hasValue = true;

              if (!first || hasSeed) {
                try {
                  acc = fn(acc, value);
                } catch (e) {
                  return observer.error(e);
                }
              } else {
                acc = value;
              }
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              if (!hasValue && !hasSeed) return observer.error(new TypeError('Cannot reduce an empty sequence'));
              observer.next(acc);
              observer.complete();
            }
          });
        });
      };

      _proto3.concat = function concat() {
        var _this5 = this;

        for (var _len = arguments.length, sources = new Array(_len), _key = 0; _key < _len; _key++) {
          sources[_key] = arguments[_key];
        }

        var C = getSpecies(this);
        return new C(function (observer) {
          var subscription;
          var index = 0;

          function startNext(next) {
            subscription = next.subscribe({
              next: function (v) {
                observer.next(v);
              },
              error: function (e) {
                observer.error(e);
              },
              complete: function () {
                if (index === sources.length) {
                  subscription = undefined;
                  observer.complete();
                } else {
                  startNext(C.from(sources[index++]));
                }
              }
            });
          }

          startNext(_this5);
          return function () {
            if (subscription) {
              subscription.unsubscribe();
              subscription = undefined;
            }
          };
        });
      };

      _proto3.flatMap = function flatMap(fn) {
        var _this6 = this;

        if (typeof fn !== 'function') throw new TypeError(fn + ' is not a function');
        var C = getSpecies(this);
        return new C(function (observer) {
          var subscriptions = [];

          var outer = _this6.subscribe({
            next: function (value) {
              if (fn) {
                try {
                  value = fn(value);
                } catch (e) {
                  return observer.error(e);
                }
              }

              var inner = C.from(value).subscribe({
                next: function (value) {
                  observer.next(value);
                },
                error: function (e) {
                  observer.error(e);
                },
                complete: function () {
                  var i = subscriptions.indexOf(inner);
                  if (i >= 0) subscriptions.splice(i, 1);
                  completeIfDone();
                }
              });
              subscriptions.push(inner);
            },
            error: function (e) {
              observer.error(e);
            },
            complete: function () {
              completeIfDone();
            }
          });

          function completeIfDone() {
            if (outer.closed && subscriptions.length === 0) observer.complete();
          }

          return function () {
            subscriptions.forEach(function (s) {
              return s.unsubscribe();
            });
            outer.unsubscribe();
          };
        });
      };

      _proto3[SymbolObservable] = function () {
        return this;
      };

      Observable.from = function from(x) {
        var C = typeof this === 'function' ? this : Observable;
        if (x == null) throw new TypeError(x + ' is not an object');
        var method = getMethod(x, SymbolObservable);

        if (method) {
          var observable = method.call(x);
          if (Object(observable) !== observable) throw new TypeError(observable + ' is not an object');
          if (isObservable(observable) && observable.constructor === C) return observable;
          return new C(function (observer) {
            return observable.subscribe(observer);
          });
        }

        if (hasSymbol('iterator')) {
          method = getMethod(x, SymbolIterator);

          if (method) {
            return new C(function (observer) {
              enqueue(function () {
                if (observer.closed) return;

                for (var _iterator = _createForOfIteratorHelperLoose(method.call(x)), _step; !(_step = _iterator()).done;) {
                  var item = _step.value;
                  observer.next(item);
                  if (observer.closed) return;
                }

                observer.complete();
              });
            });
          }
        }

        if (Array.isArray(x)) {
          return new C(function (observer) {
            enqueue(function () {
              if (observer.closed) return;

              for (var i = 0; i < x.length; ++i) {
                observer.next(x[i]);
                if (observer.closed) return;
              }

              observer.complete();
            });
          });
        }

        throw new TypeError(x + ' is not observable');
      };

      Observable.of = function of() {
        for (var _len2 = arguments.length, items = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          items[_key2] = arguments[_key2];
        }

        var C = typeof this === 'function' ? this : Observable;
        return new C(function (observer) {
          enqueue(function () {
            if (observer.closed) return;

            for (var i = 0; i < items.length; ++i) {
              observer.next(items[i]);
              if (observer.closed) return;
            }

            observer.complete();
          });
        });
      };

      _createClass$1(Observable, null, [{
        key: SymbolSpecies,
        get: function () {
          return this;
        }
      }]);

      return Observable;
    }();

    if (hasSymbols()) {
      Object.defineProperty(Observable, Symbol('extensions'), {
        value: {
          symbol: SymbolObservable,
          hostReportError: hostReportError
        },
        configurable: true
      });
    }

    function symbolObservablePonyfill(root) {
    	var result;
    	var Symbol = root.Symbol;

    	if (typeof Symbol === 'function') {
    		if (Symbol.observable) {
    			result = Symbol.observable;
    		} else {

    			if (typeof Symbol.for === 'function') {
    				// This just needs to be something that won't trample other user's Symbol.for use
    				// It also will guide people to the source of their issues, if this is problematic.
    				// META: It's a resource locator!
    				result = Symbol.for('https://github.com/benlesh/symbol-observable');
    			} else {
    				// Symbol.for didn't exist! The best we can do at this point is a totally 
    				// unique symbol. Note that the string argument here is a descriptor, not
    				// an identifier. This symbol is unique.
    				result = Symbol('https://github.com/benlesh/symbol-observable');
    			}
    			try {
    				Symbol.observable = result;
    			} catch (err) {
    				// Do nothing. In some environments, users have frozen `Symbol` for security reasons,
    				// if it is frozen assigning to it will throw. In this case, we don't care, because
    				// they will need to use the returned value from the ponyfill.
    			}
    		}
    	} else {
    		result = '@@observable';
    	}

    	return result;
    }

    /* global window */

    var root;

    if (typeof self !== 'undefined') {
      root = self;
    } else if (typeof window !== 'undefined') {
      root = window;
    } else if (typeof global !== 'undefined') {
      root = global;
    } else if (typeof module !== 'undefined') {
      root = module;
    } else {
      root = Function('return this')();
    }

    symbolObservablePonyfill(root);

    var prototype = Observable.prototype;
    var fakeObsSymbol = '@@observable';
    if (!prototype[fakeObsSymbol]) {
        prototype[fakeObsSymbol] = function () { return this; };
    }

    var toString$1 = Object.prototype.toString;
    function cloneDeep(value) {
        return cloneDeepHelper(value);
    }
    function cloneDeepHelper(val, seen) {
        switch (toString$1.call(val)) {
            case "[object Array]": {
                seen = seen || new Map;
                if (seen.has(val))
                    return seen.get(val);
                var copy_1 = val.slice(0);
                seen.set(val, copy_1);
                copy_1.forEach(function (child, i) {
                    copy_1[i] = cloneDeepHelper(child, seen);
                });
                return copy_1;
            }
            case "[object Object]": {
                seen = seen || new Map;
                if (seen.has(val))
                    return seen.get(val);
                var copy_2 = Object.create(Object.getPrototypeOf(val));
                seen.set(val, copy_2);
                Object.keys(val).forEach(function (key) {
                    copy_2[key] = cloneDeepHelper(val[key], seen);
                });
                return copy_2;
            }
            default:
                return val;
        }
    }

    function deepFreeze(value) {
        var workSet = new Set([value]);
        workSet.forEach(function (obj) {
            if (isNonNullObject(obj) && shallowFreeze(obj) === obj) {
                Object.getOwnPropertyNames(obj).forEach(function (name) {
                    if (isNonNullObject(obj[name]))
                        workSet.add(obj[name]);
                });
            }
        });
        return value;
    }
    function shallowFreeze(obj) {
        if (__DEV__ && !Object.isFrozen(obj)) {
            try {
                Object.freeze(obj);
            }
            catch (e) {
                if (e instanceof TypeError)
                    return null;
                throw e;
            }
        }
        return obj;
    }
    function maybeDeepFreeze(obj) {
        if (__DEV__) {
            deepFreeze(obj);
        }
        return obj;
    }

    function iterateObserversSafely(observers, method, argument) {
        var observersWithMethod = [];
        observers.forEach(function (obs) { return obs[method] && observersWithMethod.push(obs); });
        observersWithMethod.forEach(function (obs) { return obs[method](argument); });
    }

    function asyncMap(observable, mapFn, catchFn) {
        return new Observable(function (observer) {
            var next = observer.next, error = observer.error, complete = observer.complete;
            var activeCallbackCount = 0;
            var completed = false;
            var promiseQueue = {
                then: function (callback) {
                    return new Promise(function (resolve) { return resolve(callback()); });
                },
            };
            function makeCallback(examiner, delegate) {
                if (examiner) {
                    return function (arg) {
                        ++activeCallbackCount;
                        var both = function () { return examiner(arg); };
                        promiseQueue = promiseQueue.then(both, both).then(function (result) {
                            --activeCallbackCount;
                            next && next.call(observer, result);
                            if (completed) {
                                handler.complete();
                            }
                        }, function (error) {
                            --activeCallbackCount;
                            throw error;
                        }).catch(function (caught) {
                            error && error.call(observer, caught);
                        });
                    };
                }
                else {
                    return function (arg) { return delegate && delegate.call(observer, arg); };
                }
            }
            var handler = {
                next: makeCallback(mapFn, next),
                error: makeCallback(catchFn, error),
                complete: function () {
                    completed = true;
                    if (!activeCallbackCount) {
                        complete && complete.call(observer);
                    }
                },
            };
            var sub = observable.subscribe(handler);
            return function () { return sub.unsubscribe(); };
        });
    }

    var canUseWeakMap = typeof WeakMap === 'function' && !(typeof navigator === 'object' &&
        navigator.product === 'ReactNative');
    var canUseWeakSet = typeof WeakSet === 'function';
    var canUseSymbol = typeof Symbol === 'function' &&
        typeof Symbol.for === 'function';

    function fixObservableSubclass(subclass) {
        function set(key) {
            Object.defineProperty(subclass, key, { value: Observable });
        }
        if (canUseSymbol && Symbol.species) {
            set(Symbol.species);
        }
        set("@@species");
        return subclass;
    }

    function isPromiseLike(value) {
        return value && typeof value.then === "function";
    }
    var Concast = (function (_super) {
        __extends(Concast, _super);
        function Concast(sources) {
            var _this = _super.call(this, function (observer) {
                _this.addObserver(observer);
                return function () { return _this.removeObserver(observer); };
            }) || this;
            _this.observers = new Set();
            _this.addCount = 0;
            _this.promise = new Promise(function (resolve, reject) {
                _this.resolve = resolve;
                _this.reject = reject;
            });
            _this.handlers = {
                next: function (result) {
                    if (_this.sub !== null) {
                        _this.latest = ["next", result];
                        iterateObserversSafely(_this.observers, "next", result);
                    }
                },
                error: function (error) {
                    var sub = _this.sub;
                    if (sub !== null) {
                        if (sub)
                            setTimeout(function () { return sub.unsubscribe(); });
                        _this.sub = null;
                        _this.latest = ["error", error];
                        _this.reject(error);
                        iterateObserversSafely(_this.observers, "error", error);
                    }
                },
                complete: function () {
                    if (_this.sub !== null) {
                        var value = _this.sources.shift();
                        if (!value) {
                            _this.sub = null;
                            if (_this.latest &&
                                _this.latest[0] === "next") {
                                _this.resolve(_this.latest[1]);
                            }
                            else {
                                _this.resolve();
                            }
                            iterateObserversSafely(_this.observers, "complete");
                        }
                        else if (isPromiseLike(value)) {
                            value.then(function (obs) { return _this.sub = obs.subscribe(_this.handlers); });
                        }
                        else {
                            _this.sub = value.subscribe(_this.handlers);
                        }
                    }
                },
            };
            _this.cancel = function (reason) {
                _this.reject(reason);
                _this.sources = [];
                _this.handlers.complete();
            };
            _this.promise.catch(function (_) { });
            if (typeof sources === "function") {
                sources = [new Observable(sources)];
            }
            if (isPromiseLike(sources)) {
                sources.then(function (iterable) { return _this.start(iterable); }, _this.handlers.error);
            }
            else {
                _this.start(sources);
            }
            return _this;
        }
        Concast.prototype.start = function (sources) {
            if (this.sub !== void 0)
                return;
            this.sources = Array.from(sources);
            this.handlers.complete();
        };
        Concast.prototype.deliverLastMessage = function (observer) {
            if (this.latest) {
                var nextOrError = this.latest[0];
                var method = observer[nextOrError];
                if (method) {
                    method.call(observer, this.latest[1]);
                }
                if (this.sub === null &&
                    nextOrError === "next" &&
                    observer.complete) {
                    observer.complete();
                }
            }
        };
        Concast.prototype.addObserver = function (observer) {
            if (!this.observers.has(observer)) {
                this.deliverLastMessage(observer);
                this.observers.add(observer);
                ++this.addCount;
            }
        };
        Concast.prototype.removeObserver = function (observer, quietly) {
            if (this.observers.delete(observer) &&
                --this.addCount < 1 &&
                !quietly) {
                this.handlers.error(new Error("Observable cancelled prematurely"));
            }
        };
        Concast.prototype.cleanup = function (callback) {
            var _this = this;
            var called = false;
            var once = function () {
                if (!called) {
                    called = true;
                    _this.observers.delete(observer);
                    callback();
                }
            };
            var observer = {
                next: once,
                error: once,
                complete: once,
            };
            var count = this.addCount;
            this.addObserver(observer);
            this.addCount = count;
        };
        return Concast;
    }(Observable));
    fixObservableSubclass(Concast);

    function isNonEmptyArray(value) {
        return Array.isArray(value) && value.length > 0;
    }

    function graphQLResultHasError(result) {
        return (result.errors && result.errors.length > 0) || false;
    }

    function compact() {
        var objects = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            objects[_i] = arguments[_i];
        }
        var result = Object.create(null);
        objects.forEach(function (obj) {
            if (!obj)
                return;
            Object.keys(obj).forEach(function (key) {
                var value = obj[key];
                if (value !== void 0) {
                    result[key] = value;
                }
            });
        });
        return result;
    }

    var prefixCounts = new Map();
    function makeUniqueId(prefix) {
        var count = prefixCounts.get(prefix) || 1;
        prefixCounts.set(prefix, count + 1);
        return "".concat(prefix, ":").concat(count, ":").concat(Math.random().toString(36).slice(2));
    }

    function stringifyForDisplay(value) {
        var undefId = makeUniqueId("stringifyForDisplay");
        return JSON.stringify(value, function (key, value) {
            return value === void 0 ? undefId : value;
        }).split(JSON.stringify(undefId)).join("<undefined>");
    }

    function mergeOptions(defaults, options) {
        return compact(defaults, options, options.variables && {
            variables: __assign(__assign({}, defaults.variables), options.variables),
        });
    }

    function fromError(errorValue) {
        return new Observable(function (observer) {
            observer.error(errorValue);
        });
    }

    var throwServerError = function (response, result, message) {
        var error = new Error(message);
        error.name = 'ServerError';
        error.response = response;
        error.statusCode = response.status;
        error.result = result;
        throw error;
    };

    function validateOperation(operation) {
        var OPERATION_FIELDS = [
            'query',
            'operationName',
            'variables',
            'extensions',
            'context',
        ];
        for (var _i = 0, _a = Object.keys(operation); _i < _a.length; _i++) {
            var key = _a[_i];
            if (OPERATION_FIELDS.indexOf(key) < 0) {
                throw __DEV__ ? new InvariantError("illegal argument: ".concat(key)) : new InvariantError(24);
            }
        }
        return operation;
    }

    function createOperation(starting, operation) {
        var context = __assign({}, starting);
        var setContext = function (next) {
            if (typeof next === 'function') {
                context = __assign(__assign({}, context), next(context));
            }
            else {
                context = __assign(__assign({}, context), next);
            }
        };
        var getContext = function () { return (__assign({}, context)); };
        Object.defineProperty(operation, 'setContext', {
            enumerable: false,
            value: setContext,
        });
        Object.defineProperty(operation, 'getContext', {
            enumerable: false,
            value: getContext,
        });
        return operation;
    }

    function transformOperation(operation) {
        var transformedOperation = {
            variables: operation.variables || {},
            extensions: operation.extensions || {},
            operationName: operation.operationName,
            query: operation.query,
        };
        if (!transformedOperation.operationName) {
            transformedOperation.operationName =
                typeof transformedOperation.query !== 'string'
                    ? getOperationName(transformedOperation.query) || undefined
                    : '';
        }
        return transformedOperation;
    }

    function passthrough(op, forward) {
        return (forward ? forward(op) : Observable.of());
    }
    function toLink(handler) {
        return typeof handler === 'function' ? new ApolloLink(handler) : handler;
    }
    function isTerminating(link) {
        return link.request.length <= 1;
    }
    var LinkError = (function (_super) {
        __extends(LinkError, _super);
        function LinkError(message, link) {
            var _this = _super.call(this, message) || this;
            _this.link = link;
            return _this;
        }
        return LinkError;
    }(Error));
    var ApolloLink = (function () {
        function ApolloLink(request) {
            if (request)
                this.request = request;
        }
        ApolloLink.empty = function () {
            return new ApolloLink(function () { return Observable.of(); });
        };
        ApolloLink.from = function (links) {
            if (links.length === 0)
                return ApolloLink.empty();
            return links.map(toLink).reduce(function (x, y) { return x.concat(y); });
        };
        ApolloLink.split = function (test, left, right) {
            var leftLink = toLink(left);
            var rightLink = toLink(right || new ApolloLink(passthrough));
            if (isTerminating(leftLink) && isTerminating(rightLink)) {
                return new ApolloLink(function (operation) {
                    return test(operation)
                        ? leftLink.request(operation) || Observable.of()
                        : rightLink.request(operation) || Observable.of();
                });
            }
            else {
                return new ApolloLink(function (operation, forward) {
                    return test(operation)
                        ? leftLink.request(operation, forward) || Observable.of()
                        : rightLink.request(operation, forward) || Observable.of();
                });
            }
        };
        ApolloLink.execute = function (link, operation) {
            return (link.request(createOperation(operation.context, transformOperation(validateOperation(operation)))) || Observable.of());
        };
        ApolloLink.concat = function (first, second) {
            var firstLink = toLink(first);
            if (isTerminating(firstLink)) {
                __DEV__ && invariant$1.warn(new LinkError("You are calling concat on a terminating link, which will have no effect", firstLink));
                return firstLink;
            }
            var nextLink = toLink(second);
            if (isTerminating(nextLink)) {
                return new ApolloLink(function (operation) {
                    return firstLink.request(operation, function (op) { return nextLink.request(op) || Observable.of(); }) || Observable.of();
                });
            }
            else {
                return new ApolloLink(function (operation, forward) {
                    return (firstLink.request(operation, function (op) {
                        return nextLink.request(op, forward) || Observable.of();
                    }) || Observable.of());
                });
            }
        };
        ApolloLink.prototype.split = function (test, left, right) {
            return this.concat(ApolloLink.split(test, left, right || new ApolloLink(passthrough)));
        };
        ApolloLink.prototype.concat = function (next) {
            return ApolloLink.concat(this, next);
        };
        ApolloLink.prototype.request = function (operation, forward) {
            throw __DEV__ ? new InvariantError('request is not implemented') : new InvariantError(19);
        };
        ApolloLink.prototype.onError = function (error, observer) {
            if (observer && observer.error) {
                observer.error(error);
                return false;
            }
            throw error;
        };
        ApolloLink.prototype.setOnError = function (fn) {
            this.onError = fn;
            return this;
        };
        return ApolloLink;
    }());

    var execute = ApolloLink.execute;

    var version = '3.6.0';

    var hasOwnProperty$4 = Object.prototype.hasOwnProperty;
    function parseAndCheckHttpResponse(operations) {
        return function (response) { return response
            .text()
            .then(function (bodyText) {
            try {
                return JSON.parse(bodyText);
            }
            catch (err) {
                var parseError = err;
                parseError.name = 'ServerParseError';
                parseError.response = response;
                parseError.statusCode = response.status;
                parseError.bodyText = bodyText;
                throw parseError;
            }
        })
            .then(function (result) {
            if (response.status >= 300) {
                throwServerError(response, result, "Response not successful: Received status code ".concat(response.status));
            }
            if (!Array.isArray(result) &&
                !hasOwnProperty$4.call(result, 'data') &&
                !hasOwnProperty$4.call(result, 'errors')) {
                throwServerError(response, result, "Server response was missing for query '".concat(Array.isArray(operations)
                    ? operations.map(function (op) { return op.operationName; })
                    : operations.operationName, "'."));
            }
            return result;
        }); };
    }

    var serializeFetchParameter = function (p, label) {
        var serialized;
        try {
            serialized = JSON.stringify(p);
        }
        catch (e) {
            var parseError = __DEV__ ? new InvariantError("Network request failed. ".concat(label, " is not serializable: ").concat(e.message)) : new InvariantError(21);
            parseError.parseError = e;
            throw parseError;
        }
        return serialized;
    };

    var defaultHttpOptions = {
        includeQuery: true,
        includeExtensions: false,
    };
    var defaultHeaders = {
        accept: '*/*',
        'content-type': 'application/json',
    };
    var defaultOptions = {
        method: 'POST',
    };
    var fallbackHttpConfig = {
        http: defaultHttpOptions,
        headers: defaultHeaders,
        options: defaultOptions,
    };
    var defaultPrinter = function (ast, printer) { return printer(ast); };
    function selectHttpOptionsAndBodyInternal(operation, printer) {
        var configs = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            configs[_i - 2] = arguments[_i];
        }
        var options = {};
        var http = {};
        configs.forEach(function (config) {
            options = __assign(__assign(__assign({}, options), config.options), { headers: __assign(__assign({}, options.headers), headersToLowerCase(config.headers)) });
            if (config.credentials) {
                options.credentials = config.credentials;
            }
            http = __assign(__assign({}, http), config.http);
        });
        var operationName = operation.operationName, extensions = operation.extensions, variables = operation.variables, query = operation.query;
        var body = { operationName: operationName, variables: variables };
        if (http.includeExtensions)
            body.extensions = extensions;
        if (http.includeQuery)
            body.query = printer(query, print);
        return {
            options: options,
            body: body,
        };
    }
    function headersToLowerCase(headers) {
        if (headers) {
            var normalized_1 = Object.create(null);
            Object.keys(Object(headers)).forEach(function (name) {
                normalized_1[name.toLowerCase()] = headers[name];
            });
            return normalized_1;
        }
        return headers;
    }

    var checkFetcher = function (fetcher) {
        if (!fetcher && typeof fetch === 'undefined') {
            throw __DEV__ ? new InvariantError("\n\"fetch\" has not been found globally and no fetcher has been configured. To fix this, install a fetch package (like https://www.npmjs.com/package/cross-fetch), instantiate the fetcher, and pass it into your HttpLink constructor. For example:\n\nimport fetch from 'cross-fetch';\nimport { ApolloClient, HttpLink } from '@apollo/client';\nconst client = new ApolloClient({\n  link: new HttpLink({ uri: '/graphql', fetch })\n});\n    ") : new InvariantError(20);
        }
    };

    var createSignalIfSupported = function () {
        if (typeof AbortController === 'undefined')
            return { controller: false, signal: false };
        var controller = new AbortController();
        var signal = controller.signal;
        return { controller: controller, signal: signal };
    };

    var selectURI = function (operation, fallbackURI) {
        var context = operation.getContext();
        var contextURI = context.uri;
        if (contextURI) {
            return contextURI;
        }
        else if (typeof fallbackURI === 'function') {
            return fallbackURI(operation);
        }
        else {
            return fallbackURI || '/graphql';
        }
    };

    function rewriteURIForGET(chosenURI, body) {
        var queryParams = [];
        var addQueryParam = function (key, value) {
            queryParams.push("".concat(key, "=").concat(encodeURIComponent(value)));
        };
        if ('query' in body) {
            addQueryParam('query', body.query);
        }
        if (body.operationName) {
            addQueryParam('operationName', body.operationName);
        }
        if (body.variables) {
            var serializedVariables = void 0;
            try {
                serializedVariables = serializeFetchParameter(body.variables, 'Variables map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('variables', serializedVariables);
        }
        if (body.extensions) {
            var serializedExtensions = void 0;
            try {
                serializedExtensions = serializeFetchParameter(body.extensions, 'Extensions map');
            }
            catch (parseError) {
                return { parseError: parseError };
            }
            addQueryParam('extensions', serializedExtensions);
        }
        var fragment = '', preFragment = chosenURI;
        var fragmentStart = chosenURI.indexOf('#');
        if (fragmentStart !== -1) {
            fragment = chosenURI.substr(fragmentStart);
            preFragment = chosenURI.substr(0, fragmentStart);
        }
        var queryParamsPrefix = preFragment.indexOf('?') === -1 ? '?' : '&';
        var newURI = preFragment + queryParamsPrefix + queryParams.join('&') + fragment;
        return { newURI: newURI };
    }

    var backupFetch = maybe$1(function () { return fetch; });
    var createHttpLink = function (linkOptions) {
        if (linkOptions === void 0) { linkOptions = {}; }
        var _a = linkOptions.uri, uri = _a === void 0 ? '/graphql' : _a, preferredFetch = linkOptions.fetch, _b = linkOptions.print, print = _b === void 0 ? defaultPrinter : _b, includeExtensions = linkOptions.includeExtensions, useGETForQueries = linkOptions.useGETForQueries, _c = linkOptions.includeUnusedVariables, includeUnusedVariables = _c === void 0 ? false : _c, requestOptions = __rest(linkOptions, ["uri", "fetch", "print", "includeExtensions", "useGETForQueries", "includeUnusedVariables"]);
        if (__DEV__) {
            checkFetcher(preferredFetch || backupFetch);
        }
        var linkConfig = {
            http: { includeExtensions: includeExtensions },
            options: requestOptions.fetchOptions,
            credentials: requestOptions.credentials,
            headers: requestOptions.headers,
        };
        return new ApolloLink(function (operation) {
            var chosenURI = selectURI(operation, uri);
            var context = operation.getContext();
            var clientAwarenessHeaders = {};
            if (context.clientAwareness) {
                var _a = context.clientAwareness, name_1 = _a.name, version = _a.version;
                if (name_1) {
                    clientAwarenessHeaders['apollographql-client-name'] = name_1;
                }
                if (version) {
                    clientAwarenessHeaders['apollographql-client-version'] = version;
                }
            }
            var contextHeaders = __assign(__assign({}, clientAwarenessHeaders), context.headers);
            var contextConfig = {
                http: context.http,
                options: context.fetchOptions,
                credentials: context.credentials,
                headers: contextHeaders,
            };
            var _b = selectHttpOptionsAndBodyInternal(operation, print, fallbackHttpConfig, linkConfig, contextConfig), options = _b.options, body = _b.body;
            if (body.variables && !includeUnusedVariables) {
                var unusedNames_1 = new Set(Object.keys(body.variables));
                visit(operation.query, {
                    Variable: function (node, _key, parent) {
                        if (parent && parent.kind !== 'VariableDefinition') {
                            unusedNames_1.delete(node.name.value);
                        }
                    },
                });
                if (unusedNames_1.size) {
                    body.variables = __assign({}, body.variables);
                    unusedNames_1.forEach(function (name) {
                        delete body.variables[name];
                    });
                }
            }
            var controller;
            if (!options.signal) {
                var _c = createSignalIfSupported(), _controller = _c.controller, signal = _c.signal;
                controller = _controller;
                if (controller)
                    options.signal = signal;
            }
            var definitionIsMutation = function (d) {
                return d.kind === 'OperationDefinition' && d.operation === 'mutation';
            };
            if (useGETForQueries &&
                !operation.query.definitions.some(definitionIsMutation)) {
                options.method = 'GET';
            }
            if (options.method === 'GET') {
                var _d = rewriteURIForGET(chosenURI, body), newURI = _d.newURI, parseError = _d.parseError;
                if (parseError) {
                    return fromError(parseError);
                }
                chosenURI = newURI;
            }
            else {
                try {
                    options.body = serializeFetchParameter(body, 'Payload');
                }
                catch (parseError) {
                    return fromError(parseError);
                }
            }
            return new Observable(function (observer) {
                var currentFetch = preferredFetch || maybe$1(function () { return fetch; }) || backupFetch;
                currentFetch(chosenURI, options)
                    .then(function (response) {
                    operation.setContext({ response: response });
                    return response;
                })
                    .then(parseAndCheckHttpResponse(operation))
                    .then(function (result) {
                    observer.next(result);
                    observer.complete();
                    return result;
                })
                    .catch(function (err) {
                    if (err.name === 'AbortError')
                        return;
                    if (err.result && err.result.errors && err.result.data) {
                        observer.next(err.result);
                    }
                    observer.error(err);
                });
                return function () {
                    if (controller)
                        controller.abort();
                };
            });
        });
    };

    var HttpLink = (function (_super) {
        __extends(HttpLink, _super);
        function HttpLink(options) {
            if (options === void 0) { options = {}; }
            var _this = _super.call(this, createHttpLink(options).request) || this;
            _this.options = options;
            return _this;
        }
        return HttpLink;
    }(ApolloLink));

    var _a$2 = Object.prototype, toString = _a$2.toString, hasOwnProperty$3 = _a$2.hasOwnProperty;
    var fnToStr = Function.prototype.toString;
    var previousComparisons = new Map();
    /**
     * Performs a deep equality check on two JavaScript values, tolerating cycles.
     */
    function equal(a, b) {
        try {
            return check(a, b);
        }
        finally {
            previousComparisons.clear();
        }
    }
    function check(a, b) {
        // If the two values are strictly equal, our job is easy.
        if (a === b) {
            return true;
        }
        // Object.prototype.toString returns a representation of the runtime type of
        // the given value that is considerably more precise than typeof.
        var aTag = toString.call(a);
        var bTag = toString.call(b);
        // If the runtime types of a and b are different, they could maybe be equal
        // under some interpretation of equality, but for simplicity and performance
        // we just return false instead.
        if (aTag !== bTag) {
            return false;
        }
        switch (aTag) {
            case '[object Array]':
                // Arrays are a lot like other objects, but we can cheaply compare their
                // lengths as a short-cut before comparing their elements.
                if (a.length !== b.length)
                    return false;
            // Fall through to object case...
            case '[object Object]': {
                if (previouslyCompared(a, b))
                    return true;
                var aKeys = definedKeys(a);
                var bKeys = definedKeys(b);
                // If `a` and `b` have a different number of enumerable keys, they
                // must be different.
                var keyCount = aKeys.length;
                if (keyCount !== bKeys.length)
                    return false;
                // Now make sure they have the same keys.
                for (var k = 0; k < keyCount; ++k) {
                    if (!hasOwnProperty$3.call(b, aKeys[k])) {
                        return false;
                    }
                }
                // Finally, check deep equality of all child properties.
                for (var k = 0; k < keyCount; ++k) {
                    var key = aKeys[k];
                    if (!check(a[key], b[key])) {
                        return false;
                    }
                }
                return true;
            }
            case '[object Error]':
                return a.name === b.name && a.message === b.message;
            case '[object Number]':
                // Handle NaN, which is !== itself.
                if (a !== a)
                    return b !== b;
            // Fall through to shared +a === +b case...
            case '[object Boolean]':
            case '[object Date]':
                return +a === +b;
            case '[object RegExp]':
            case '[object String]':
                return a == "" + b;
            case '[object Map]':
            case '[object Set]': {
                if (a.size !== b.size)
                    return false;
                if (previouslyCompared(a, b))
                    return true;
                var aIterator = a.entries();
                var isMap = aTag === '[object Map]';
                while (true) {
                    var info = aIterator.next();
                    if (info.done)
                        break;
                    // If a instanceof Set, aValue === aKey.
                    var _a = info.value, aKey = _a[0], aValue = _a[1];
                    // So this works the same way for both Set and Map.
                    if (!b.has(aKey)) {
                        return false;
                    }
                    // However, we care about deep equality of values only when dealing
                    // with Map structures.
                    if (isMap && !check(aValue, b.get(aKey))) {
                        return false;
                    }
                }
                return true;
            }
            case '[object Uint16Array]':
            case '[object Uint8Array]': // Buffer, in Node.js.
            case '[object Uint32Array]':
            case '[object Int32Array]':
            case '[object Int8Array]':
            case '[object Int16Array]':
            case '[object ArrayBuffer]':
                // DataView doesn't need these conversions, but the equality check is
                // otherwise the same.
                a = new Uint8Array(a);
                b = new Uint8Array(b);
            // Fall through...
            case '[object DataView]': {
                var len = a.byteLength;
                if (len === b.byteLength) {
                    while (len-- && a[len] === b[len]) {
                        // Keep looping as long as the bytes are equal.
                    }
                }
                return len === -1;
            }
            case '[object AsyncFunction]':
            case '[object GeneratorFunction]':
            case '[object AsyncGeneratorFunction]':
            case '[object Function]': {
                var aCode = fnToStr.call(a);
                if (aCode !== fnToStr.call(b)) {
                    return false;
                }
                // We consider non-native functions equal if they have the same code
                // (native functions require === because their code is censored).
                // Note that this behavior is not entirely sound, since !== function
                // objects with the same code can behave differently depending on
                // their closure scope. However, any function can behave differently
                // depending on the values of its input arguments (including this)
                // and its calling context (including its closure scope), even
                // though the function object is === to itself; and it is entirely
                // possible for functions that are not === to behave exactly the
                // same under all conceivable circumstances. Because none of these
                // factors are statically decidable in JavaScript, JS function
                // equality is not well-defined. This ambiguity allows us to
                // consider the best possible heuristic among various imperfect
                // options, and equating non-native functions that have the same
                // code has enormous practical benefits, such as when comparing
                // functions that are repeatedly passed as fresh function
                // expressions within objects that are otherwise deeply equal. Since
                // any function created from the same syntactic expression (in the
                // same code location) will always stringify to the same code
                // according to fnToStr.call, we can reasonably expect these
                // repeatedly passed function expressions to have the same code, and
                // thus behave "the same" (with all the caveats mentioned above),
                // even though the runtime function objects are !== to one another.
                return !endsWith(aCode, nativeCodeSuffix);
            }
        }
        // Otherwise the values are not equal.
        return false;
    }
    function definedKeys(obj) {
        // Remember that the second argument to Array.prototype.filter will be
        // used as `this` within the callback function.
        return Object.keys(obj).filter(isDefinedKey, obj);
    }
    function isDefinedKey(key) {
        return this[key] !== void 0;
    }
    var nativeCodeSuffix = "{ [native code] }";
    function endsWith(full, suffix) {
        var fromIndex = full.length - suffix.length;
        return fromIndex >= 0 &&
            full.indexOf(suffix, fromIndex) === fromIndex;
    }
    function previouslyCompared(a, b) {
        // Though cyclic references can make an object graph appear infinite from the
        // perspective of a depth-first traversal, the graph still contains a finite
        // number of distinct object references. We use the previousComparisons cache
        // to avoid comparing the same pair of object references more than once, which
        // guarantees termination (even if we end up comparing every object in one
        // graph to every object in the other graph, which is extremely unlikely),
        // while still allowing weird isomorphic structures (like rings with different
        // lengths) a chance to pass the equality test.
        var bSet = previousComparisons.get(a);
        if (bSet) {
            // Return true here because we can be sure false will be returned somewhere
            // else if the objects are not equivalent.
            if (bSet.has(b))
                return true;
        }
        else {
            previousComparisons.set(a, bSet = new Set);
        }
        bSet.add(b);
        return false;
    }

    // A [trie](https://en.wikipedia.org/wiki/Trie) data structure that holds
    // object keys weakly, yet can also hold non-object keys, unlike the
    // native `WeakMap`.
    // If no makeData function is supplied, the looked-up data will be an empty,
    // null-prototype Object.
    var defaultMakeData = function () { return Object.create(null); };
    // Useful for processing arguments objects as well as arrays.
    var _a$1 = Array.prototype, forEach = _a$1.forEach, slice = _a$1.slice;
    var Trie = /** @class */ (function () {
        function Trie(weakness, makeData) {
            if (weakness === void 0) { weakness = true; }
            if (makeData === void 0) { makeData = defaultMakeData; }
            this.weakness = weakness;
            this.makeData = makeData;
        }
        Trie.prototype.lookup = function () {
            var array = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                array[_i] = arguments[_i];
            }
            return this.lookupArray(array);
        };
        Trie.prototype.lookupArray = function (array) {
            var node = this;
            forEach.call(array, function (key) { return node = node.getChildTrie(key); });
            return node.data || (node.data = this.makeData(slice.call(array)));
        };
        Trie.prototype.getChildTrie = function (key) {
            var map = this.weakness && isObjRef(key)
                ? this.weak || (this.weak = new WeakMap())
                : this.strong || (this.strong = new Map());
            var child = map.get(key);
            if (!child)
                map.set(key, child = new Trie(this.weakness, this.makeData));
            return child;
        };
        return Trie;
    }());
    function isObjRef(value) {
        switch (typeof value) {
            case "object":
                if (value === null)
                    break;
            // Fall through to return true...
            case "function":
                return true;
        }
        return false;
    }

    // This currentContext variable will only be used if the makeSlotClass
    // function is called, which happens only if this is the first copy of the
    // @wry/context package to be imported.
    var currentContext = null;
    // This unique internal object is used to denote the absence of a value
    // for a given Slot, and is never exposed to outside code.
    var MISSING_VALUE = {};
    var idCounter = 1;
    // Although we can't do anything about the cost of duplicated code from
    // accidentally bundling multiple copies of the @wry/context package, we can
    // avoid creating the Slot class more than once using makeSlotClass.
    var makeSlotClass = function () { return /** @class */ (function () {
        function Slot() {
            // If you have a Slot object, you can find out its slot.id, but you cannot
            // guess the slot.id of a Slot you don't have access to, thanks to the
            // randomized suffix.
            this.id = [
                "slot",
                idCounter++,
                Date.now(),
                Math.random().toString(36).slice(2),
            ].join(":");
        }
        Slot.prototype.hasValue = function () {
            for (var context_1 = currentContext; context_1; context_1 = context_1.parent) {
                // We use the Slot object iself as a key to its value, which means the
                // value cannot be obtained without a reference to the Slot object.
                if (this.id in context_1.slots) {
                    var value = context_1.slots[this.id];
                    if (value === MISSING_VALUE)
                        break;
                    if (context_1 !== currentContext) {
                        // Cache the value in currentContext.slots so the next lookup will
                        // be faster. This caching is safe because the tree of contexts and
                        // the values of the slots are logically immutable.
                        currentContext.slots[this.id] = value;
                    }
                    return true;
                }
            }
            if (currentContext) {
                // If a value was not found for this Slot, it's never going to be found
                // no matter how many times we look it up, so we might as well cache
                // the absence of the value, too.
                currentContext.slots[this.id] = MISSING_VALUE;
            }
            return false;
        };
        Slot.prototype.getValue = function () {
            if (this.hasValue()) {
                return currentContext.slots[this.id];
            }
        };
        Slot.prototype.withValue = function (value, callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            var _a;
            var slots = (_a = {
                    __proto__: null
                },
                _a[this.id] = value,
                _a);
            var parent = currentContext;
            currentContext = { parent: parent, slots: slots };
            try {
                // Function.prototype.apply allows the arguments array argument to be
                // omitted or undefined, so args! is fine here.
                return callback.apply(thisArg, args);
            }
            finally {
                currentContext = parent;
            }
        };
        // Capture the current context and wrap a callback function so that it
        // reestablishes the captured context when called.
        Slot.bind = function (callback) {
            var context = currentContext;
            return function () {
                var saved = currentContext;
                try {
                    currentContext = context;
                    return callback.apply(this, arguments);
                }
                finally {
                    currentContext = saved;
                }
            };
        };
        // Immediately run a callback function without any captured context.
        Slot.noContext = function (callback, 
        // Given the prevalence of arrow functions, specifying arguments is likely
        // to be much more common than specifying `this`, hence this ordering:
        args, thisArg) {
            if (currentContext) {
                var saved = currentContext;
                try {
                    currentContext = null;
                    // Function.prototype.apply allows the arguments array argument to be
                    // omitted or undefined, so args! is fine here.
                    return callback.apply(thisArg, args);
                }
                finally {
                    currentContext = saved;
                }
            }
            else {
                return callback.apply(thisArg, args);
            }
        };
        return Slot;
    }()); };
    // We store a single global implementation of the Slot class as a permanent
    // non-enumerable symbol property of the Array constructor. This obfuscation
    // does nothing to prevent access to the Slot class, but at least it ensures
    // the implementation (i.e. currentContext) cannot be tampered with, and all
    // copies of the @wry/context package (hopefully just one) will share the
    // same Slot implementation. Since the first copy of the @wry/context package
    // to be imported wins, this technique imposes a very high cost for any
    // future breaking changes to the Slot class.
    var globalKey = "@wry/context:Slot";
    var host = Array;
    var Slot = host[globalKey] || function () {
        var Slot = makeSlotClass();
        try {
            Object.defineProperty(host, globalKey, {
                value: host[globalKey] = Slot,
                enumerable: false,
                writable: false,
                configurable: false,
            });
        }
        finally {
            return Slot;
        }
    }();

    Slot.bind; Slot.noContext;

    function defaultDispose() { }
    var Cache = /** @class */ (function () {
        function Cache(max, dispose) {
            if (max === void 0) { max = Infinity; }
            if (dispose === void 0) { dispose = defaultDispose; }
            this.max = max;
            this.dispose = dispose;
            this.map = new Map();
            this.newest = null;
            this.oldest = null;
        }
        Cache.prototype.has = function (key) {
            return this.map.has(key);
        };
        Cache.prototype.get = function (key) {
            var node = this.getNode(key);
            return node && node.value;
        };
        Cache.prototype.getNode = function (key) {
            var node = this.map.get(key);
            if (node && node !== this.newest) {
                var older = node.older, newer = node.newer;
                if (newer) {
                    newer.older = older;
                }
                if (older) {
                    older.newer = newer;
                }
                node.older = this.newest;
                node.older.newer = node;
                node.newer = null;
                this.newest = node;
                if (node === this.oldest) {
                    this.oldest = newer;
                }
            }
            return node;
        };
        Cache.prototype.set = function (key, value) {
            var node = this.getNode(key);
            if (node) {
                return node.value = value;
            }
            node = {
                key: key,
                value: value,
                newer: null,
                older: this.newest
            };
            if (this.newest) {
                this.newest.newer = node;
            }
            this.newest = node;
            this.oldest = this.oldest || node;
            this.map.set(key, node);
            return node.value;
        };
        Cache.prototype.clean = function () {
            while (this.oldest && this.map.size > this.max) {
                this.delete(this.oldest.key);
            }
        };
        Cache.prototype.delete = function (key) {
            var node = this.map.get(key);
            if (node) {
                if (node === this.newest) {
                    this.newest = node.older;
                }
                if (node === this.oldest) {
                    this.oldest = node.newer;
                }
                if (node.newer) {
                    node.newer.older = node.older;
                }
                if (node.older) {
                    node.older.newer = node.newer;
                }
                this.map.delete(key);
                this.dispose(node.value, key);
                return true;
            }
            return false;
        };
        return Cache;
    }());

    var parentEntrySlot = new Slot();

    var _a;
    var hasOwnProperty$2 = Object.prototype.hasOwnProperty;
    var 
    // This Array.from polyfill is restricted to working with Set<any> for now,
    // but we can improve the polyfill and add other input types, as needed. Note
    // that this fallback implementation will only be used if the host environment
    // does not support a native Array.from function. In most modern JS runtimes,
    // the toArray function exported here will be === Array.from.
    toArray$1 = (_a = Array.from, _a === void 0 ? function (collection) {
        var array = [];
        collection.forEach(function (item) { return array.push(item); });
        return array;
    } : _a);
    function maybeUnsubscribe(entryOrDep) {
        var unsubscribe = entryOrDep.unsubscribe;
        if (typeof unsubscribe === "function") {
            entryOrDep.unsubscribe = void 0;
            unsubscribe();
        }
    }

    var emptySetPool = [];
    var POOL_TARGET_SIZE = 100;
    // Since this package might be used browsers, we should avoid using the
    // Node built-in assert module.
    function assert(condition, optionalMessage) {
        if (!condition) {
            throw new Error(optionalMessage || "assertion failure");
        }
    }
    function valueIs(a, b) {
        var len = a.length;
        return (
        // Unknown values are not equal to each other.
        len > 0 &&
            // Both values must be ordinary (or both exceptional) to be equal.
            len === b.length &&
            // The underlying value or exception must be the same.
            a[len - 1] === b[len - 1]);
    }
    function valueGet(value) {
        switch (value.length) {
            case 0: throw new Error("unknown value");
            case 1: return value[0];
            case 2: throw value[1];
        }
    }
    function valueCopy(value) {
        return value.slice(0);
    }
    var Entry = /** @class */ (function () {
        function Entry(fn) {
            this.fn = fn;
            this.parents = new Set();
            this.childValues = new Map();
            // When this Entry has children that are dirty, this property becomes
            // a Set containing other Entry objects, borrowed from emptySetPool.
            // When the set becomes empty, it gets recycled back to emptySetPool.
            this.dirtyChildren = null;
            this.dirty = true;
            this.recomputing = false;
            this.value = [];
            this.deps = null;
            ++Entry.count;
        }
        Entry.prototype.peek = function () {
            if (this.value.length === 1 && !mightBeDirty(this)) {
                rememberParent(this);
                return this.value[0];
            }
        };
        // This is the most important method of the Entry API, because it
        // determines whether the cached this.value can be returned immediately,
        // or must be recomputed. The overall performance of the caching system
        // depends on the truth of the following observations: (1) this.dirty is
        // usually false, (2) this.dirtyChildren is usually null/empty, and thus
        // (3) valueGet(this.value) is usually returned without recomputation.
        Entry.prototype.recompute = function (args) {
            assert(!this.recomputing, "already recomputing");
            rememberParent(this);
            return mightBeDirty(this)
                ? reallyRecompute(this, args)
                : valueGet(this.value);
        };
        Entry.prototype.setDirty = function () {
            if (this.dirty)
                return;
            this.dirty = true;
            this.value.length = 0;
            reportDirty(this);
            // We can go ahead and unsubscribe here, since any further dirty
            // notifications we receive will be redundant, and unsubscribing may
            // free up some resources, e.g. file watchers.
            maybeUnsubscribe(this);
        };
        Entry.prototype.dispose = function () {
            var _this = this;
            this.setDirty();
            // Sever any dependency relationships with our own children, so those
            // children don't retain this parent Entry in their child.parents sets,
            // thereby preventing it from being fully garbage collected.
            forgetChildren(this);
            // Because this entry has been kicked out of the cache (in index.js),
            // we've lost the ability to find out if/when this entry becomes dirty,
            // whether that happens through a subscription, because of a direct call
            // to entry.setDirty(), or because one of its children becomes dirty.
            // Because of this loss of future information, we have to assume the
            // worst (that this entry might have become dirty very soon), so we must
            // immediately mark this entry's parents as dirty. Normally we could
            // just call entry.setDirty() rather than calling parent.setDirty() for
            // each parent, but that would leave this entry in parent.childValues
            // and parent.dirtyChildren, which would prevent the child from being
            // truly forgotten.
            eachParent(this, function (parent, child) {
                parent.setDirty();
                forgetChild(parent, _this);
            });
        };
        Entry.prototype.forget = function () {
            // The code that creates Entry objects in index.ts will replace this method
            // with one that actually removes the Entry from the cache, which will also
            // trigger the entry.dispose method.
            this.dispose();
        };
        Entry.prototype.dependOn = function (dep) {
            dep.add(this);
            if (!this.deps) {
                this.deps = emptySetPool.pop() || new Set();
            }
            this.deps.add(dep);
        };
        Entry.prototype.forgetDeps = function () {
            var _this = this;
            if (this.deps) {
                toArray$1(this.deps).forEach(function (dep) { return dep.delete(_this); });
                this.deps.clear();
                emptySetPool.push(this.deps);
                this.deps = null;
            }
        };
        Entry.count = 0;
        return Entry;
    }());
    function rememberParent(child) {
        var parent = parentEntrySlot.getValue();
        if (parent) {
            child.parents.add(parent);
            if (!parent.childValues.has(child)) {
                parent.childValues.set(child, []);
            }
            if (mightBeDirty(child)) {
                reportDirtyChild(parent, child);
            }
            else {
                reportCleanChild(parent, child);
            }
            return parent;
        }
    }
    function reallyRecompute(entry, args) {
        forgetChildren(entry);
        // Set entry as the parent entry while calling recomputeNewValue(entry).
        parentEntrySlot.withValue(entry, recomputeNewValue, [entry, args]);
        if (maybeSubscribe(entry, args)) {
            // If we successfully recomputed entry.value and did not fail to
            // (re)subscribe, then this Entry is no longer explicitly dirty.
            setClean(entry);
        }
        return valueGet(entry.value);
    }
    function recomputeNewValue(entry, args) {
        entry.recomputing = true;
        // Set entry.value as unknown.
        entry.value.length = 0;
        try {
            // If entry.fn succeeds, entry.value will become a normal Value.
            entry.value[0] = entry.fn.apply(null, args);
        }
        catch (e) {
            // If entry.fn throws, entry.value will become exceptional.
            entry.value[1] = e;
        }
        // Either way, this line is always reached.
        entry.recomputing = false;
    }
    function mightBeDirty(entry) {
        return entry.dirty || !!(entry.dirtyChildren && entry.dirtyChildren.size);
    }
    function setClean(entry) {
        entry.dirty = false;
        if (mightBeDirty(entry)) {
            // This Entry may still have dirty children, in which case we can't
            // let our parents know we're clean just yet.
            return;
        }
        reportClean(entry);
    }
    function reportDirty(child) {
        eachParent(child, reportDirtyChild);
    }
    function reportClean(child) {
        eachParent(child, reportCleanChild);
    }
    function eachParent(child, callback) {
        var parentCount = child.parents.size;
        if (parentCount) {
            var parents = toArray$1(child.parents);
            for (var i = 0; i < parentCount; ++i) {
                callback(parents[i], child);
            }
        }
    }
    // Let a parent Entry know that one of its children may be dirty.
    function reportDirtyChild(parent, child) {
        // Must have called rememberParent(child) before calling
        // reportDirtyChild(parent, child).
        assert(parent.childValues.has(child));
        assert(mightBeDirty(child));
        var parentWasClean = !mightBeDirty(parent);
        if (!parent.dirtyChildren) {
            parent.dirtyChildren = emptySetPool.pop() || new Set;
        }
        else if (parent.dirtyChildren.has(child)) {
            // If we already know this child is dirty, then we must have already
            // informed our own parents that we are dirty, so we can terminate
            // the recursion early.
            return;
        }
        parent.dirtyChildren.add(child);
        // If parent was clean before, it just became (possibly) dirty (according to
        // mightBeDirty), since we just added child to parent.dirtyChildren.
        if (parentWasClean) {
            reportDirty(parent);
        }
    }
    // Let a parent Entry know that one of its children is no longer dirty.
    function reportCleanChild(parent, child) {
        // Must have called rememberChild(child) before calling
        // reportCleanChild(parent, child).
        assert(parent.childValues.has(child));
        assert(!mightBeDirty(child));
        var childValue = parent.childValues.get(child);
        if (childValue.length === 0) {
            parent.childValues.set(child, valueCopy(child.value));
        }
        else if (!valueIs(childValue, child.value)) {
            parent.setDirty();
        }
        removeDirtyChild(parent, child);
        if (mightBeDirty(parent)) {
            return;
        }
        reportClean(parent);
    }
    function removeDirtyChild(parent, child) {
        var dc = parent.dirtyChildren;
        if (dc) {
            dc.delete(child);
            if (dc.size === 0) {
                if (emptySetPool.length < POOL_TARGET_SIZE) {
                    emptySetPool.push(dc);
                }
                parent.dirtyChildren = null;
            }
        }
    }
    // Removes all children from this entry and returns an array of the
    // removed children.
    function forgetChildren(parent) {
        if (parent.childValues.size > 0) {
            parent.childValues.forEach(function (_value, child) {
                forgetChild(parent, child);
            });
        }
        // Remove this parent Entry from any sets to which it was added by the
        // addToSet method.
        parent.forgetDeps();
        // After we forget all our children, this.dirtyChildren must be empty
        // and therefore must have been reset to null.
        assert(parent.dirtyChildren === null);
    }
    function forgetChild(parent, child) {
        child.parents.delete(parent);
        parent.childValues.delete(child);
        removeDirtyChild(parent, child);
    }
    function maybeSubscribe(entry, args) {
        if (typeof entry.subscribe === "function") {
            try {
                maybeUnsubscribe(entry); // Prevent double subscriptions.
                entry.unsubscribe = entry.subscribe.apply(null, args);
            }
            catch (e) {
                // If this Entry has a subscribe function and it threw an exception
                // (or an unsubscribe function it previously returned now throws),
                // return false to indicate that we were not able to subscribe (or
                // unsubscribe), and this Entry should remain dirty.
                entry.setDirty();
                return false;
            }
        }
        // Returning true indicates either that there was no entry.subscribe
        // function or that it succeeded.
        return true;
    }

    var EntryMethods = {
        setDirty: true,
        dispose: true,
        forget: true,
    };
    function dep(options) {
        var depsByKey = new Map();
        var subscribe = options && options.subscribe;
        function depend(key) {
            var parent = parentEntrySlot.getValue();
            if (parent) {
                var dep_1 = depsByKey.get(key);
                if (!dep_1) {
                    depsByKey.set(key, dep_1 = new Set);
                }
                parent.dependOn(dep_1);
                if (typeof subscribe === "function") {
                    maybeUnsubscribe(dep_1);
                    dep_1.unsubscribe = subscribe(key);
                }
            }
        }
        depend.dirty = function dirty(key, entryMethodName) {
            var dep = depsByKey.get(key);
            if (dep) {
                var m_1 = (entryMethodName &&
                    hasOwnProperty$2.call(EntryMethods, entryMethodName)) ? entryMethodName : "setDirty";
                // We have to use toArray(dep).forEach instead of dep.forEach, because
                // modifying a Set while iterating over it can cause elements in the Set
                // to be removed from the Set before they've been iterated over.
                toArray$1(dep).forEach(function (entry) { return entry[m_1](); });
                depsByKey.delete(key);
                maybeUnsubscribe(dep);
            }
        };
        return depend;
    }

    function makeDefaultMakeCacheKeyFunction() {
        var keyTrie = new Trie(typeof WeakMap === "function");
        return function () {
            return keyTrie.lookupArray(arguments);
        };
    }
    // The defaultMakeCacheKey function is remarkably powerful, because it gives
    // a unique object for any shallow-identical list of arguments. If you need
    // to implement a custom makeCacheKey function, you may find it helpful to
    // delegate the final work to defaultMakeCacheKey, which is why we export it
    // here. However, you may want to avoid defaultMakeCacheKey if your runtime
    // does not support WeakMap, or you have the ability to return a string key.
    // In those cases, just write your own custom makeCacheKey functions.
    makeDefaultMakeCacheKeyFunction();
    var caches = new Set();
    function wrap(originalFunction, options) {
        if (options === void 0) { options = Object.create(null); }
        var cache = new Cache(options.max || Math.pow(2, 16), function (entry) { return entry.dispose(); });
        var keyArgs = options.keyArgs;
        var makeCacheKey = options.makeCacheKey ||
            makeDefaultMakeCacheKeyFunction();
        var optimistic = function () {
            var key = makeCacheKey.apply(null, keyArgs ? keyArgs.apply(null, arguments) : arguments);
            if (key === void 0) {
                return originalFunction.apply(null, arguments);
            }
            var entry = cache.get(key);
            if (!entry) {
                cache.set(key, entry = new Entry(originalFunction));
                entry.subscribe = options.subscribe;
                // Give the Entry the ability to trigger cache.delete(key), even though
                // the Entry itself does not know about key or cache.
                entry.forget = function () { return cache.delete(key); };
            }
            var value = entry.recompute(Array.prototype.slice.call(arguments));
            // Move this entry to the front of the least-recently used queue,
            // since we just finished computing its value.
            cache.set(key, entry);
            caches.add(cache);
            // Clean up any excess entries in the cache, but only if there is no
            // active parent entry, meaning we're not in the middle of a larger
            // computation that might be flummoxed by the cleaning.
            if (!parentEntrySlot.hasValue()) {
                caches.forEach(function (cache) { return cache.clean(); });
                caches.clear();
            }
            return value;
        };
        Object.defineProperty(optimistic, "size", {
            get: function () {
                return cache["map"].size;
            },
            configurable: false,
            enumerable: false,
        });
        function dirtyKey(key) {
            var entry = cache.get(key);
            if (entry) {
                entry.setDirty();
            }
        }
        optimistic.dirtyKey = dirtyKey;
        optimistic.dirty = function dirty() {
            dirtyKey(makeCacheKey.apply(null, arguments));
        };
        function peekKey(key) {
            var entry = cache.get(key);
            if (entry) {
                return entry.peek();
            }
        }
        optimistic.peekKey = peekKey;
        optimistic.peek = function peek() {
            return peekKey(makeCacheKey.apply(null, arguments));
        };
        function forgetKey(key) {
            return cache.delete(key);
        }
        optimistic.forgetKey = forgetKey;
        optimistic.forget = function forget() {
            return forgetKey(makeCacheKey.apply(null, arguments));
        };
        optimistic.makeCacheKey = makeCacheKey;
        optimistic.getKey = keyArgs ? function getKey() {
            return makeCacheKey.apply(null, keyArgs.apply(null, arguments));
        } : makeCacheKey;
        return Object.freeze(optimistic);
    }

    var ApolloCache = (function () {
        function ApolloCache() {
            this.getFragmentDoc = wrap(getFragmentQueryDocument);
        }
        ApolloCache.prototype.batch = function (options) {
            var _this = this;
            var optimisticId = typeof options.optimistic === "string" ? options.optimistic :
                options.optimistic === false ? null : void 0;
            var updateResult;
            this.performTransaction(function () { return updateResult = options.update(_this); }, optimisticId);
            return updateResult;
        };
        ApolloCache.prototype.recordOptimisticTransaction = function (transaction, optimisticId) {
            this.performTransaction(transaction, optimisticId);
        };
        ApolloCache.prototype.transformDocument = function (document) {
            return document;
        };
        ApolloCache.prototype.identify = function (object) {
            return;
        };
        ApolloCache.prototype.gc = function () {
            return [];
        };
        ApolloCache.prototype.modify = function (options) {
            return false;
        };
        ApolloCache.prototype.transformForLink = function (document) {
            return document;
        };
        ApolloCache.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = !!options.optimistic; }
            return this.read(__assign(__assign({}, options), { rootId: options.id || 'ROOT_QUERY', optimistic: optimistic }));
        };
        ApolloCache.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = !!options.optimistic; }
            return this.read(__assign(__assign({}, options), { query: this.getFragmentDoc(options.fragment, options.fragmentName), rootId: options.id, optimistic: optimistic }));
        };
        ApolloCache.prototype.writeQuery = function (_a) {
            var id = _a.id, data = _a.data, options = __rest(_a, ["id", "data"]);
            return this.write(Object.assign(options, {
                dataId: id || 'ROOT_QUERY',
                result: data,
            }));
        };
        ApolloCache.prototype.writeFragment = function (_a) {
            var id = _a.id, data = _a.data, fragment = _a.fragment, fragmentName = _a.fragmentName, options = __rest(_a, ["id", "data", "fragment", "fragmentName"]);
            return this.write(Object.assign(options, {
                query: this.getFragmentDoc(fragment, fragmentName),
                dataId: id,
                result: data,
            }));
        };
        ApolloCache.prototype.updateQuery = function (options, update) {
            return this.batch({
                update: function (cache) {
                    var value = cache.readQuery(options);
                    var data = update(value);
                    if (data === void 0 || data === null)
                        return value;
                    cache.writeQuery(__assign(__assign({}, options), { data: data }));
                    return data;
                },
            });
        };
        ApolloCache.prototype.updateFragment = function (options, update) {
            return this.batch({
                update: function (cache) {
                    var value = cache.readFragment(options);
                    var data = update(value);
                    if (data === void 0 || data === null)
                        return value;
                    cache.writeFragment(__assign(__assign({}, options), { data: data }));
                    return data;
                },
            });
        };
        return ApolloCache;
    }());

    var MissingFieldError = (function () {
        function MissingFieldError(message, path, query, variables) {
            this.message = message;
            this.path = path;
            this.query = query;
            this.variables = variables;
        }
        return MissingFieldError;
    }());

    var hasOwn = Object.prototype.hasOwnProperty;
    function defaultDataIdFromObject(_a, context) {
        var __typename = _a.__typename, id = _a.id, _id = _a._id;
        if (typeof __typename === "string") {
            if (context) {
                context.keyObject =
                    id !== void 0 ? { id: id } :
                        _id !== void 0 ? { _id: _id } :
                            void 0;
            }
            if (id === void 0)
                id = _id;
            if (id !== void 0) {
                return "".concat(__typename, ":").concat((typeof id === "number" ||
                    typeof id === "string") ? id : JSON.stringify(id));
            }
        }
    }
    var defaultConfig = {
        dataIdFromObject: defaultDataIdFromObject,
        addTypename: true,
        resultCaching: true,
        canonizeResults: false,
    };
    function normalizeConfig(config) {
        return compact(defaultConfig, config);
    }
    function shouldCanonizeResults(config) {
        var value = config.canonizeResults;
        return value === void 0 ? defaultConfig.canonizeResults : value;
    }
    function getTypenameFromStoreObject(store, objectOrReference) {
        return isReference(objectOrReference)
            ? store.get(objectOrReference.__ref, "__typename")
            : objectOrReference && objectOrReference.__typename;
    }
    var TypeOrFieldNameRegExp = /^[_a-z][_0-9a-z]*/i;
    function fieldNameFromStoreName(storeFieldName) {
        var match = storeFieldName.match(TypeOrFieldNameRegExp);
        return match ? match[0] : storeFieldName;
    }
    function selectionSetMatchesResult(selectionSet, result, variables) {
        if (isNonNullObject(result)) {
            return isArray(result)
                ? result.every(function (item) { return selectionSetMatchesResult(selectionSet, item, variables); })
                : selectionSet.selections.every(function (field) {
                    if (isField(field) && shouldInclude(field, variables)) {
                        var key = resultKeyNameFromField(field);
                        return hasOwn.call(result, key) &&
                            (!field.selectionSet ||
                                selectionSetMatchesResult(field.selectionSet, result[key], variables));
                    }
                    return true;
                });
        }
        return false;
    }
    function storeValueIsStoreObject(value) {
        return isNonNullObject(value) &&
            !isReference(value) &&
            !isArray(value);
    }
    function makeProcessedFieldsMerger() {
        return new DeepMerger;
    }
    var isArray = function (a) { return Array.isArray(a); };

    var DELETE = Object.create(null);
    var delModifier = function () { return DELETE; };
    var INVALIDATE = Object.create(null);
    var EntityStore = (function () {
        function EntityStore(policies, group) {
            var _this = this;
            this.policies = policies;
            this.group = group;
            this.data = Object.create(null);
            this.rootIds = Object.create(null);
            this.refs = Object.create(null);
            this.getFieldValue = function (objectOrReference, storeFieldName) { return maybeDeepFreeze(isReference(objectOrReference)
                ? _this.get(objectOrReference.__ref, storeFieldName)
                : objectOrReference && objectOrReference[storeFieldName]); };
            this.canRead = function (objOrRef) {
                return isReference(objOrRef)
                    ? _this.has(objOrRef.__ref)
                    : typeof objOrRef === "object";
            };
            this.toReference = function (objOrIdOrRef, mergeIntoStore) {
                if (typeof objOrIdOrRef === "string") {
                    return makeReference(objOrIdOrRef);
                }
                if (isReference(objOrIdOrRef)) {
                    return objOrIdOrRef;
                }
                var id = _this.policies.identify(objOrIdOrRef)[0];
                if (id) {
                    var ref = makeReference(id);
                    if (mergeIntoStore) {
                        _this.merge(id, objOrIdOrRef);
                    }
                    return ref;
                }
            };
        }
        EntityStore.prototype.toObject = function () {
            return __assign({}, this.data);
        };
        EntityStore.prototype.has = function (dataId) {
            return this.lookup(dataId, true) !== void 0;
        };
        EntityStore.prototype.get = function (dataId, fieldName) {
            this.group.depend(dataId, fieldName);
            if (hasOwn.call(this.data, dataId)) {
                var storeObject = this.data[dataId];
                if (storeObject && hasOwn.call(storeObject, fieldName)) {
                    return storeObject[fieldName];
                }
            }
            if (fieldName === "__typename" &&
                hasOwn.call(this.policies.rootTypenamesById, dataId)) {
                return this.policies.rootTypenamesById[dataId];
            }
            if (this instanceof Layer) {
                return this.parent.get(dataId, fieldName);
            }
        };
        EntityStore.prototype.lookup = function (dataId, dependOnExistence) {
            if (dependOnExistence)
                this.group.depend(dataId, "__exists");
            if (hasOwn.call(this.data, dataId)) {
                return this.data[dataId];
            }
            if (this instanceof Layer) {
                return this.parent.lookup(dataId, dependOnExistence);
            }
            if (this.policies.rootTypenamesById[dataId]) {
                return Object.create(null);
            }
        };
        EntityStore.prototype.merge = function (older, newer) {
            var _this = this;
            var dataId;
            if (isReference(older))
                older = older.__ref;
            if (isReference(newer))
                newer = newer.__ref;
            var existing = typeof older === "string"
                ? this.lookup(dataId = older)
                : older;
            var incoming = typeof newer === "string"
                ? this.lookup(dataId = newer)
                : newer;
            if (!incoming)
                return;
            __DEV__ ? invariant$1(typeof dataId === "string", "store.merge expects a string ID") : invariant$1(typeof dataId === "string", 1);
            var merged = new DeepMerger(storeObjectReconciler).merge(existing, incoming);
            this.data[dataId] = merged;
            if (merged !== existing) {
                delete this.refs[dataId];
                if (this.group.caching) {
                    var fieldsToDirty_1 = Object.create(null);
                    if (!existing)
                        fieldsToDirty_1.__exists = 1;
                    Object.keys(incoming).forEach(function (storeFieldName) {
                        if (!existing || existing[storeFieldName] !== merged[storeFieldName]) {
                            fieldsToDirty_1[storeFieldName] = 1;
                            var fieldName = fieldNameFromStoreName(storeFieldName);
                            if (fieldName !== storeFieldName &&
                                !_this.policies.hasKeyArgs(merged.__typename, fieldName)) {
                                fieldsToDirty_1[fieldName] = 1;
                            }
                            if (merged[storeFieldName] === void 0 && !(_this instanceof Layer)) {
                                delete merged[storeFieldName];
                            }
                        }
                    });
                    if (fieldsToDirty_1.__typename &&
                        !(existing && existing.__typename) &&
                        this.policies.rootTypenamesById[dataId] === merged.__typename) {
                        delete fieldsToDirty_1.__typename;
                    }
                    Object.keys(fieldsToDirty_1).forEach(function (fieldName) { return _this.group.dirty(dataId, fieldName); });
                }
            }
        };
        EntityStore.prototype.modify = function (dataId, fields) {
            var _this = this;
            var storeObject = this.lookup(dataId);
            if (storeObject) {
                var changedFields_1 = Object.create(null);
                var needToMerge_1 = false;
                var allDeleted_1 = true;
                var sharedDetails_1 = {
                    DELETE: DELETE,
                    INVALIDATE: INVALIDATE,
                    isReference: isReference,
                    toReference: this.toReference,
                    canRead: this.canRead,
                    readField: function (fieldNameOrOptions, from) { return _this.policies.readField(typeof fieldNameOrOptions === "string" ? {
                        fieldName: fieldNameOrOptions,
                        from: from || makeReference(dataId),
                    } : fieldNameOrOptions, { store: _this }); },
                };
                Object.keys(storeObject).forEach(function (storeFieldName) {
                    var fieldName = fieldNameFromStoreName(storeFieldName);
                    var fieldValue = storeObject[storeFieldName];
                    if (fieldValue === void 0)
                        return;
                    var modify = typeof fields === "function"
                        ? fields
                        : fields[storeFieldName] || fields[fieldName];
                    if (modify) {
                        var newValue = modify === delModifier ? DELETE :
                            modify(maybeDeepFreeze(fieldValue), __assign(__assign({}, sharedDetails_1), { fieldName: fieldName, storeFieldName: storeFieldName, storage: _this.getStorage(dataId, storeFieldName) }));
                        if (newValue === INVALIDATE) {
                            _this.group.dirty(dataId, storeFieldName);
                        }
                        else {
                            if (newValue === DELETE)
                                newValue = void 0;
                            if (newValue !== fieldValue) {
                                changedFields_1[storeFieldName] = newValue;
                                needToMerge_1 = true;
                                fieldValue = newValue;
                            }
                        }
                    }
                    if (fieldValue !== void 0) {
                        allDeleted_1 = false;
                    }
                });
                if (needToMerge_1) {
                    this.merge(dataId, changedFields_1);
                    if (allDeleted_1) {
                        if (this instanceof Layer) {
                            this.data[dataId] = void 0;
                        }
                        else {
                            delete this.data[dataId];
                        }
                        this.group.dirty(dataId, "__exists");
                    }
                    return true;
                }
            }
            return false;
        };
        EntityStore.prototype.delete = function (dataId, fieldName, args) {
            var _a;
            var storeObject = this.lookup(dataId);
            if (storeObject) {
                var typename = this.getFieldValue(storeObject, "__typename");
                var storeFieldName = fieldName && args
                    ? this.policies.getStoreFieldName({ typename: typename, fieldName: fieldName, args: args })
                    : fieldName;
                return this.modify(dataId, storeFieldName ? (_a = {},
                    _a[storeFieldName] = delModifier,
                    _a) : delModifier);
            }
            return false;
        };
        EntityStore.prototype.evict = function (options, limit) {
            var evicted = false;
            if (options.id) {
                if (hasOwn.call(this.data, options.id)) {
                    evicted = this.delete(options.id, options.fieldName, options.args);
                }
                if (this instanceof Layer && this !== limit) {
                    evicted = this.parent.evict(options, limit) || evicted;
                }
                if (options.fieldName || evicted) {
                    this.group.dirty(options.id, options.fieldName || "__exists");
                }
            }
            return evicted;
        };
        EntityStore.prototype.clear = function () {
            this.replace(null);
        };
        EntityStore.prototype.extract = function () {
            var _this = this;
            var obj = this.toObject();
            var extraRootIds = [];
            this.getRootIdSet().forEach(function (id) {
                if (!hasOwn.call(_this.policies.rootTypenamesById, id)) {
                    extraRootIds.push(id);
                }
            });
            if (extraRootIds.length) {
                obj.__META = { extraRootIds: extraRootIds.sort() };
            }
            return obj;
        };
        EntityStore.prototype.replace = function (newData) {
            var _this = this;
            Object.keys(this.data).forEach(function (dataId) {
                if (!(newData && hasOwn.call(newData, dataId))) {
                    _this.delete(dataId);
                }
            });
            if (newData) {
                var __META = newData.__META, rest_1 = __rest(newData, ["__META"]);
                Object.keys(rest_1).forEach(function (dataId) {
                    _this.merge(dataId, rest_1[dataId]);
                });
                if (__META) {
                    __META.extraRootIds.forEach(this.retain, this);
                }
            }
        };
        EntityStore.prototype.retain = function (rootId) {
            return this.rootIds[rootId] = (this.rootIds[rootId] || 0) + 1;
        };
        EntityStore.prototype.release = function (rootId) {
            if (this.rootIds[rootId] > 0) {
                var count = --this.rootIds[rootId];
                if (!count)
                    delete this.rootIds[rootId];
                return count;
            }
            return 0;
        };
        EntityStore.prototype.getRootIdSet = function (ids) {
            if (ids === void 0) { ids = new Set(); }
            Object.keys(this.rootIds).forEach(ids.add, ids);
            if (this instanceof Layer) {
                this.parent.getRootIdSet(ids);
            }
            else {
                Object.keys(this.policies.rootTypenamesById).forEach(ids.add, ids);
            }
            return ids;
        };
        EntityStore.prototype.gc = function () {
            var _this = this;
            var ids = this.getRootIdSet();
            var snapshot = this.toObject();
            ids.forEach(function (id) {
                if (hasOwn.call(snapshot, id)) {
                    Object.keys(_this.findChildRefIds(id)).forEach(ids.add, ids);
                    delete snapshot[id];
                }
            });
            var idsToRemove = Object.keys(snapshot);
            if (idsToRemove.length) {
                var root_1 = this;
                while (root_1 instanceof Layer)
                    root_1 = root_1.parent;
                idsToRemove.forEach(function (id) { return root_1.delete(id); });
            }
            return idsToRemove;
        };
        EntityStore.prototype.findChildRefIds = function (dataId) {
            if (!hasOwn.call(this.refs, dataId)) {
                var found_1 = this.refs[dataId] = Object.create(null);
                var root = this.data[dataId];
                if (!root)
                    return found_1;
                var workSet_1 = new Set([root]);
                workSet_1.forEach(function (obj) {
                    if (isReference(obj)) {
                        found_1[obj.__ref] = true;
                    }
                    if (isNonNullObject(obj)) {
                        Object.keys(obj).forEach(function (key) {
                            var child = obj[key];
                            if (isNonNullObject(child)) {
                                workSet_1.add(child);
                            }
                        });
                    }
                });
            }
            return this.refs[dataId];
        };
        EntityStore.prototype.makeCacheKey = function () {
            return this.group.keyMaker.lookupArray(arguments);
        };
        return EntityStore;
    }());
    var CacheGroup = (function () {
        function CacheGroup(caching, parent) {
            if (parent === void 0) { parent = null; }
            this.caching = caching;
            this.parent = parent;
            this.d = null;
            this.resetCaching();
        }
        CacheGroup.prototype.resetCaching = function () {
            this.d = this.caching ? dep() : null;
            this.keyMaker = new Trie(canUseWeakMap);
        };
        CacheGroup.prototype.depend = function (dataId, storeFieldName) {
            if (this.d) {
                this.d(makeDepKey(dataId, storeFieldName));
                var fieldName = fieldNameFromStoreName(storeFieldName);
                if (fieldName !== storeFieldName) {
                    this.d(makeDepKey(dataId, fieldName));
                }
                if (this.parent) {
                    this.parent.depend(dataId, storeFieldName);
                }
            }
        };
        CacheGroup.prototype.dirty = function (dataId, storeFieldName) {
            if (this.d) {
                this.d.dirty(makeDepKey(dataId, storeFieldName), storeFieldName === "__exists" ? "forget" : "setDirty");
            }
        };
        return CacheGroup;
    }());
    function makeDepKey(dataId, storeFieldName) {
        return storeFieldName + '#' + dataId;
    }
    function maybeDependOnExistenceOfEntity(store, entityId) {
        if (supportsResultCaching(store)) {
            store.group.depend(entityId, "__exists");
        }
    }
    (function (EntityStore) {
        var Root = (function (_super) {
            __extends(Root, _super);
            function Root(_a) {
                var policies = _a.policies, _b = _a.resultCaching, resultCaching = _b === void 0 ? true : _b, seed = _a.seed;
                var _this = _super.call(this, policies, new CacheGroup(resultCaching)) || this;
                _this.stump = new Stump(_this);
                _this.storageTrie = new Trie(canUseWeakMap);
                if (seed)
                    _this.replace(seed);
                return _this;
            }
            Root.prototype.addLayer = function (layerId, replay) {
                return this.stump.addLayer(layerId, replay);
            };
            Root.prototype.removeLayer = function () {
                return this;
            };
            Root.prototype.getStorage = function () {
                return this.storageTrie.lookupArray(arguments);
            };
            return Root;
        }(EntityStore));
        EntityStore.Root = Root;
    })(EntityStore || (EntityStore = {}));
    var Layer = (function (_super) {
        __extends(Layer, _super);
        function Layer(id, parent, replay, group) {
            var _this = _super.call(this, parent.policies, group) || this;
            _this.id = id;
            _this.parent = parent;
            _this.replay = replay;
            _this.group = group;
            replay(_this);
            return _this;
        }
        Layer.prototype.addLayer = function (layerId, replay) {
            return new Layer(layerId, this, replay, this.group);
        };
        Layer.prototype.removeLayer = function (layerId) {
            var _this = this;
            var parent = this.parent.removeLayer(layerId);
            if (layerId === this.id) {
                if (this.group.caching) {
                    Object.keys(this.data).forEach(function (dataId) {
                        var ownStoreObject = _this.data[dataId];
                        var parentStoreObject = parent["lookup"](dataId);
                        if (!parentStoreObject) {
                            _this.delete(dataId);
                        }
                        else if (!ownStoreObject) {
                            _this.group.dirty(dataId, "__exists");
                            Object.keys(parentStoreObject).forEach(function (storeFieldName) {
                                _this.group.dirty(dataId, storeFieldName);
                            });
                        }
                        else if (ownStoreObject !== parentStoreObject) {
                            Object.keys(ownStoreObject).forEach(function (storeFieldName) {
                                if (!equal(ownStoreObject[storeFieldName], parentStoreObject[storeFieldName])) {
                                    _this.group.dirty(dataId, storeFieldName);
                                }
                            });
                        }
                    });
                }
                return parent;
            }
            if (parent === this.parent)
                return this;
            return parent.addLayer(this.id, this.replay);
        };
        Layer.prototype.toObject = function () {
            return __assign(__assign({}, this.parent.toObject()), this.data);
        };
        Layer.prototype.findChildRefIds = function (dataId) {
            var fromParent = this.parent.findChildRefIds(dataId);
            return hasOwn.call(this.data, dataId) ? __assign(__assign({}, fromParent), _super.prototype.findChildRefIds.call(this, dataId)) : fromParent;
        };
        Layer.prototype.getStorage = function () {
            var p = this.parent;
            while (p.parent)
                p = p.parent;
            return p.getStorage.apply(p, arguments);
        };
        return Layer;
    }(EntityStore));
    var Stump = (function (_super) {
        __extends(Stump, _super);
        function Stump(root) {
            return _super.call(this, "EntityStore.Stump", root, function () { }, new CacheGroup(root.group.caching, root.group)) || this;
        }
        Stump.prototype.removeLayer = function () {
            return this;
        };
        Stump.prototype.merge = function () {
            return this.parent.merge.apply(this.parent, arguments);
        };
        return Stump;
    }(Layer));
    function storeObjectReconciler(existingObject, incomingObject, property) {
        var existingValue = existingObject[property];
        var incomingValue = incomingObject[property];
        return equal(existingValue, incomingValue) ? existingValue : incomingValue;
    }
    function supportsResultCaching(store) {
        return !!(store instanceof EntityStore && store.group.caching);
    }

    function shallowCopy(value) {
        if (isNonNullObject(value)) {
            return isArray(value)
                ? value.slice(0)
                : __assign({ __proto__: Object.getPrototypeOf(value) }, value);
        }
        return value;
    }
    var ObjectCanon = (function () {
        function ObjectCanon() {
            this.known = new (canUseWeakSet ? WeakSet : Set)();
            this.pool = new Trie(canUseWeakMap);
            this.passes = new WeakMap();
            this.keysByJSON = new Map();
            this.empty = this.admit({});
        }
        ObjectCanon.prototype.isKnown = function (value) {
            return isNonNullObject(value) && this.known.has(value);
        };
        ObjectCanon.prototype.pass = function (value) {
            if (isNonNullObject(value)) {
                var copy = shallowCopy(value);
                this.passes.set(copy, value);
                return copy;
            }
            return value;
        };
        ObjectCanon.prototype.admit = function (value) {
            var _this = this;
            if (isNonNullObject(value)) {
                var original = this.passes.get(value);
                if (original)
                    return original;
                var proto = Object.getPrototypeOf(value);
                switch (proto) {
                    case Array.prototype: {
                        if (this.known.has(value))
                            return value;
                        var array = value.map(this.admit, this);
                        var node = this.pool.lookupArray(array);
                        if (!node.array) {
                            this.known.add(node.array = array);
                            if (__DEV__) {
                                Object.freeze(array);
                            }
                        }
                        return node.array;
                    }
                    case null:
                    case Object.prototype: {
                        if (this.known.has(value))
                            return value;
                        var proto_1 = Object.getPrototypeOf(value);
                        var array_1 = [proto_1];
                        var keys = this.sortedKeys(value);
                        array_1.push(keys.json);
                        var firstValueIndex_1 = array_1.length;
                        keys.sorted.forEach(function (key) {
                            array_1.push(_this.admit(value[key]));
                        });
                        var node = this.pool.lookupArray(array_1);
                        if (!node.object) {
                            var obj_1 = node.object = Object.create(proto_1);
                            this.known.add(obj_1);
                            keys.sorted.forEach(function (key, i) {
                                obj_1[key] = array_1[firstValueIndex_1 + i];
                            });
                            if (__DEV__) {
                                Object.freeze(obj_1);
                            }
                        }
                        return node.object;
                    }
                }
            }
            return value;
        };
        ObjectCanon.prototype.sortedKeys = function (obj) {
            var keys = Object.keys(obj);
            var node = this.pool.lookupArray(keys);
            if (!node.keys) {
                keys.sort();
                var json = JSON.stringify(keys);
                if (!(node.keys = this.keysByJSON.get(json))) {
                    this.keysByJSON.set(json, node.keys = { sorted: keys, json: json });
                }
            }
            return node.keys;
        };
        return ObjectCanon;
    }());
    var canonicalStringify = Object.assign(function (value) {
        if (isNonNullObject(value)) {
            if (stringifyCanon === void 0) {
                resetCanonicalStringify();
            }
            var canonical = stringifyCanon.admit(value);
            var json = stringifyCache.get(canonical);
            if (json === void 0) {
                stringifyCache.set(canonical, json = JSON.stringify(canonical));
            }
            return json;
        }
        return JSON.stringify(value);
    }, {
        reset: resetCanonicalStringify,
    });
    var stringifyCanon;
    var stringifyCache;
    function resetCanonicalStringify() {
        stringifyCanon = new ObjectCanon;
        stringifyCache = new (canUseWeakMap ? WeakMap : Map)();
    }

    function execSelectionSetKeyArgs(options) {
        return [
            options.selectionSet,
            options.objectOrReference,
            options.context,
            options.context.canonizeResults,
        ];
    }
    var StoreReader = (function () {
        function StoreReader(config) {
            var _this = this;
            this.knownResults = new (canUseWeakMap ? WeakMap : Map)();
            this.config = compact(config, {
                addTypename: config.addTypename !== false,
                canonizeResults: shouldCanonizeResults(config),
            });
            this.canon = config.canon || new ObjectCanon;
            this.executeSelectionSet = wrap(function (options) {
                var _a;
                var canonizeResults = options.context.canonizeResults;
                var peekArgs = execSelectionSetKeyArgs(options);
                peekArgs[3] = !canonizeResults;
                var other = (_a = _this.executeSelectionSet).peek.apply(_a, peekArgs);
                if (other) {
                    if (canonizeResults) {
                        return __assign(__assign({}, other), { result: _this.canon.admit(other.result) });
                    }
                    return other;
                }
                maybeDependOnExistenceOfEntity(options.context.store, options.enclosingRef.__ref);
                return _this.execSelectionSetImpl(options);
            }, {
                max: this.config.resultCacheMaxSize,
                keyArgs: execSelectionSetKeyArgs,
                makeCacheKey: function (selectionSet, parent, context, canonizeResults) {
                    if (supportsResultCaching(context.store)) {
                        return context.store.makeCacheKey(selectionSet, isReference(parent) ? parent.__ref : parent, context.varString, canonizeResults);
                    }
                }
            });
            this.executeSubSelectedArray = wrap(function (options) {
                maybeDependOnExistenceOfEntity(options.context.store, options.enclosingRef.__ref);
                return _this.execSubSelectedArrayImpl(options);
            }, {
                max: this.config.resultCacheMaxSize,
                makeCacheKey: function (_a) {
                    var field = _a.field, array = _a.array, context = _a.context;
                    if (supportsResultCaching(context.store)) {
                        return context.store.makeCacheKey(field, array, context.varString);
                    }
                }
            });
        }
        StoreReader.prototype.resetCanon = function () {
            this.canon = new ObjectCanon;
        };
        StoreReader.prototype.diffQueryAgainstStore = function (_a) {
            var store = _a.store, query = _a.query, _b = _a.rootId, rootId = _b === void 0 ? 'ROOT_QUERY' : _b, variables = _a.variables, _c = _a.returnPartialData, returnPartialData = _c === void 0 ? true : _c, _d = _a.canonizeResults, canonizeResults = _d === void 0 ? this.config.canonizeResults : _d;
            var policies = this.config.cache.policies;
            variables = __assign(__assign({}, getDefaultValues(getQueryDefinition(query))), variables);
            var rootRef = makeReference(rootId);
            var merger = new DeepMerger;
            var execResult = this.executeSelectionSet({
                selectionSet: getMainDefinition(query).selectionSet,
                objectOrReference: rootRef,
                enclosingRef: rootRef,
                context: {
                    store: store,
                    query: query,
                    policies: policies,
                    variables: variables,
                    varString: canonicalStringify(variables),
                    canonizeResults: canonizeResults,
                    fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
                    merge: function (a, b) {
                        return merger.merge(a, b);
                    },
                },
            });
            var missing;
            if (execResult.missing) {
                missing = [new MissingFieldError(firstMissing(execResult.missing), execResult.missing, query, variables)];
                if (!returnPartialData) {
                    throw missing[0];
                }
            }
            return {
                result: execResult.result,
                complete: !missing,
                missing: missing,
            };
        };
        StoreReader.prototype.isFresh = function (result, parent, selectionSet, context) {
            if (supportsResultCaching(context.store) &&
                this.knownResults.get(result) === selectionSet) {
                var latest = this.executeSelectionSet.peek(selectionSet, parent, context, this.canon.isKnown(result));
                if (latest && result === latest.result) {
                    return true;
                }
            }
            return false;
        };
        StoreReader.prototype.execSelectionSetImpl = function (_a) {
            var _this = this;
            var selectionSet = _a.selectionSet, objectOrReference = _a.objectOrReference, enclosingRef = _a.enclosingRef, context = _a.context;
            if (isReference(objectOrReference) &&
                !context.policies.rootTypenamesById[objectOrReference.__ref] &&
                !context.store.has(objectOrReference.__ref)) {
                return {
                    result: this.canon.empty,
                    missing: "Dangling reference to missing ".concat(objectOrReference.__ref, " object"),
                };
            }
            var variables = context.variables, policies = context.policies, store = context.store;
            var typename = store.getFieldValue(objectOrReference, "__typename");
            var result = {};
            var missing;
            if (this.config.addTypename &&
                typeof typename === "string" &&
                !policies.rootIdsByTypename[typename]) {
                result = { __typename: typename };
            }
            function handleMissing(result, resultName) {
                var _a;
                if (result.missing) {
                    missing = context.merge(missing, (_a = {}, _a[resultName] = result.missing, _a));
                }
                return result.result;
            }
            var workSet = new Set(selectionSet.selections);
            workSet.forEach(function (selection) {
                var _a, _b;
                if (!shouldInclude(selection, variables))
                    return;
                if (isField(selection)) {
                    var fieldValue = policies.readField({
                        fieldName: selection.name.value,
                        field: selection,
                        variables: context.variables,
                        from: objectOrReference,
                    }, context);
                    var resultName = resultKeyNameFromField(selection);
                    if (fieldValue === void 0) {
                        if (!addTypenameToDocument.added(selection)) {
                            missing = context.merge(missing, (_a = {},
                                _a[resultName] = "Can't find field '".concat(selection.name.value, "' on ").concat(isReference(objectOrReference)
                                    ? objectOrReference.__ref + " object"
                                    : "object " + JSON.stringify(objectOrReference, null, 2)),
                                _a));
                        }
                    }
                    else if (isArray(fieldValue)) {
                        fieldValue = handleMissing(_this.executeSubSelectedArray({
                            field: selection,
                            array: fieldValue,
                            enclosingRef: enclosingRef,
                            context: context,
                        }), resultName);
                    }
                    else if (!selection.selectionSet) {
                        if (context.canonizeResults) {
                            fieldValue = _this.canon.pass(fieldValue);
                        }
                    }
                    else if (fieldValue != null) {
                        fieldValue = handleMissing(_this.executeSelectionSet({
                            selectionSet: selection.selectionSet,
                            objectOrReference: fieldValue,
                            enclosingRef: isReference(fieldValue) ? fieldValue : enclosingRef,
                            context: context,
                        }), resultName);
                    }
                    if (fieldValue !== void 0) {
                        result = context.merge(result, (_b = {}, _b[resultName] = fieldValue, _b));
                    }
                }
                else {
                    var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                    if (fragment && policies.fragmentMatches(fragment, typename)) {
                        fragment.selectionSet.selections.forEach(workSet.add, workSet);
                    }
                }
            });
            var finalResult = { result: result, missing: missing };
            var frozen = context.canonizeResults
                ? this.canon.admit(finalResult)
                : maybeDeepFreeze(finalResult);
            if (frozen.result) {
                this.knownResults.set(frozen.result, selectionSet);
            }
            return frozen;
        };
        StoreReader.prototype.execSubSelectedArrayImpl = function (_a) {
            var _this = this;
            var field = _a.field, array = _a.array, enclosingRef = _a.enclosingRef, context = _a.context;
            var missing;
            function handleMissing(childResult, i) {
                var _a;
                if (childResult.missing) {
                    missing = context.merge(missing, (_a = {}, _a[i] = childResult.missing, _a));
                }
                return childResult.result;
            }
            if (field.selectionSet) {
                array = array.filter(context.store.canRead);
            }
            array = array.map(function (item, i) {
                if (item === null) {
                    return null;
                }
                if (isArray(item)) {
                    return handleMissing(_this.executeSubSelectedArray({
                        field: field,
                        array: item,
                        enclosingRef: enclosingRef,
                        context: context,
                    }), i);
                }
                if (field.selectionSet) {
                    return handleMissing(_this.executeSelectionSet({
                        selectionSet: field.selectionSet,
                        objectOrReference: item,
                        enclosingRef: isReference(item) ? item : enclosingRef,
                        context: context,
                    }), i);
                }
                if (__DEV__) {
                    assertSelectionSetForIdValue(context.store, field, item);
                }
                return item;
            });
            return {
                result: context.canonizeResults ? this.canon.admit(array) : array,
                missing: missing,
            };
        };
        return StoreReader;
    }());
    function firstMissing(tree) {
        try {
            JSON.stringify(tree, function (_, value) {
                if (typeof value === "string")
                    throw value;
                return value;
            });
        }
        catch (result) {
            return result;
        }
    }
    function assertSelectionSetForIdValue(store, field, fieldValue) {
        if (!field.selectionSet) {
            var workSet_1 = new Set([fieldValue]);
            workSet_1.forEach(function (value) {
                if (isNonNullObject(value)) {
                    __DEV__ ? invariant$1(!isReference(value), "Missing selection set for object of type ".concat(getTypenameFromStoreObject(store, value), " returned for query field ").concat(field.name.value)) : invariant$1(!isReference(value), 5);
                    Object.values(value).forEach(workSet_1.add, workSet_1);
                }
            });
        }
    }

    var cacheSlot = new Slot();
    var cacheInfoMap = new WeakMap();
    function getCacheInfo(cache) {
        var info = cacheInfoMap.get(cache);
        if (!info) {
            cacheInfoMap.set(cache, info = {
                vars: new Set,
                dep: dep(),
            });
        }
        return info;
    }
    function forgetCache(cache) {
        getCacheInfo(cache).vars.forEach(function (rv) { return rv.forgetCache(cache); });
    }
    function recallCache(cache) {
        getCacheInfo(cache).vars.forEach(function (rv) { return rv.attachCache(cache); });
    }
    function makeVar(value) {
        var caches = new Set();
        var listeners = new Set();
        var rv = function (newValue) {
            if (arguments.length > 0) {
                if (value !== newValue) {
                    value = newValue;
                    caches.forEach(function (cache) {
                        getCacheInfo(cache).dep.dirty(rv);
                        broadcast(cache);
                    });
                    var oldListeners = Array.from(listeners);
                    listeners.clear();
                    oldListeners.forEach(function (listener) { return listener(value); });
                }
            }
            else {
                var cache = cacheSlot.getValue();
                if (cache) {
                    attach(cache);
                    getCacheInfo(cache).dep(rv);
                }
            }
            return value;
        };
        rv.onNextChange = function (listener) {
            listeners.add(listener);
            return function () {
                listeners.delete(listener);
            };
        };
        var attach = rv.attachCache = function (cache) {
            caches.add(cache);
            getCacheInfo(cache).vars.add(rv);
            return rv;
        };
        rv.forgetCache = function (cache) { return caches.delete(cache); };
        return rv;
    }
    function broadcast(cache) {
        if (cache.broadcastWatches) {
            cache.broadcastWatches();
        }
    }

    var specifierInfoCache = Object.create(null);
    function lookupSpecifierInfo(spec) {
        var cacheKey = JSON.stringify(spec);
        return specifierInfoCache[cacheKey] ||
            (specifierInfoCache[cacheKey] = Object.create(null));
    }
    function keyFieldsFnFromSpecifier(specifier) {
        var info = lookupSpecifierInfo(specifier);
        return info.keyFieldsFn || (info.keyFieldsFn = function (object, context) {
            var extract = function (from, key) { return context.readField(key, from); };
            var keyObject = context.keyObject = collectSpecifierPaths(specifier, function (schemaKeyPath) {
                var extracted = extractKeyPath(context.storeObject, schemaKeyPath, extract);
                if (extracted === void 0 &&
                    object !== context.storeObject &&
                    hasOwn.call(object, schemaKeyPath[0])) {
                    extracted = extractKeyPath(object, schemaKeyPath, extractKey);
                }
                __DEV__ ? invariant$1(extracted !== void 0, "Missing field '".concat(schemaKeyPath.join('.'), "' while extracting keyFields from ").concat(JSON.stringify(object))) : invariant$1(extracted !== void 0, 2);
                return extracted;
            });
            return "".concat(context.typename, ":").concat(JSON.stringify(keyObject));
        });
    }
    function keyArgsFnFromSpecifier(specifier) {
        var info = lookupSpecifierInfo(specifier);
        return info.keyArgsFn || (info.keyArgsFn = function (args, _a) {
            var field = _a.field, variables = _a.variables, fieldName = _a.fieldName;
            var collected = collectSpecifierPaths(specifier, function (keyPath) {
                var firstKey = keyPath[0];
                var firstChar = firstKey.charAt(0);
                if (firstChar === "@") {
                    if (field && isNonEmptyArray(field.directives)) {
                        var directiveName_1 = firstKey.slice(1);
                        var d = field.directives.find(function (d) { return d.name.value === directiveName_1; });
                        var directiveArgs = d && argumentsObjectFromField(d, variables);
                        return directiveArgs && extractKeyPath(directiveArgs, keyPath.slice(1));
                    }
                    return;
                }
                if (firstChar === "$") {
                    var variableName = firstKey.slice(1);
                    if (variables && hasOwn.call(variables, variableName)) {
                        var varKeyPath = keyPath.slice(0);
                        varKeyPath[0] = variableName;
                        return extractKeyPath(variables, varKeyPath);
                    }
                    return;
                }
                if (args) {
                    return extractKeyPath(args, keyPath);
                }
            });
            var suffix = JSON.stringify(collected);
            if (args || suffix !== "{}") {
                fieldName += ":" + suffix;
            }
            return fieldName;
        });
    }
    function collectSpecifierPaths(specifier, extractor) {
        var merger = new DeepMerger;
        return getSpecifierPaths(specifier).reduce(function (collected, path) {
            var _a;
            var toMerge = extractor(path);
            if (toMerge !== void 0) {
                for (var i = path.length - 1; i >= 0; --i) {
                    toMerge = (_a = {}, _a[path[i]] = toMerge, _a);
                }
                collected = merger.merge(collected, toMerge);
            }
            return collected;
        }, Object.create(null));
    }
    function getSpecifierPaths(spec) {
        var info = lookupSpecifierInfo(spec);
        if (!info.paths) {
            var paths_1 = info.paths = [];
            var currentPath_1 = [];
            spec.forEach(function (s, i) {
                if (isArray(s)) {
                    getSpecifierPaths(s).forEach(function (p) { return paths_1.push(currentPath_1.concat(p)); });
                    currentPath_1.length = 0;
                }
                else {
                    currentPath_1.push(s);
                    if (!isArray(spec[i + 1])) {
                        paths_1.push(currentPath_1.slice(0));
                        currentPath_1.length = 0;
                    }
                }
            });
        }
        return info.paths;
    }
    function extractKey(object, key) {
        return object[key];
    }
    function extractKeyPath(object, path, extract) {
        extract = extract || extractKey;
        return normalize$1(path.reduce(function reducer(obj, key) {
            return isArray(obj)
                ? obj.map(function (child) { return reducer(child, key); })
                : obj && extract(obj, key);
        }, object));
    }
    function normalize$1(value) {
        if (isNonNullObject(value)) {
            if (isArray(value)) {
                return value.map(normalize$1);
            }
            return collectSpecifierPaths(Object.keys(value).sort(), function (path) { return extractKeyPath(value, path); });
        }
        return value;
    }

    getStoreKeyName.setStringify(canonicalStringify);
    function argsFromFieldSpecifier(spec) {
        return spec.args !== void 0 ? spec.args :
            spec.field ? argumentsObjectFromField(spec.field, spec.variables) : null;
    }
    var nullKeyFieldsFn = function () { return void 0; };
    var simpleKeyArgsFn = function (_args, context) { return context.fieldName; };
    var mergeTrueFn = function (existing, incoming, _a) {
        var mergeObjects = _a.mergeObjects;
        return mergeObjects(existing, incoming);
    };
    var mergeFalseFn = function (_, incoming) { return incoming; };
    var Policies = (function () {
        function Policies(config) {
            this.config = config;
            this.typePolicies = Object.create(null);
            this.toBeAdded = Object.create(null);
            this.supertypeMap = new Map();
            this.fuzzySubtypes = new Map();
            this.rootIdsByTypename = Object.create(null);
            this.rootTypenamesById = Object.create(null);
            this.usingPossibleTypes = false;
            this.config = __assign({ dataIdFromObject: defaultDataIdFromObject }, config);
            this.cache = this.config.cache;
            this.setRootTypename("Query");
            this.setRootTypename("Mutation");
            this.setRootTypename("Subscription");
            if (config.possibleTypes) {
                this.addPossibleTypes(config.possibleTypes);
            }
            if (config.typePolicies) {
                this.addTypePolicies(config.typePolicies);
            }
        }
        Policies.prototype.identify = function (object, partialContext) {
            var _a;
            var policies = this;
            var typename = partialContext && (partialContext.typename ||
                ((_a = partialContext.storeObject) === null || _a === void 0 ? void 0 : _a.__typename)) || object.__typename;
            if (typename === this.rootTypenamesById.ROOT_QUERY) {
                return ["ROOT_QUERY"];
            }
            var storeObject = partialContext && partialContext.storeObject || object;
            var context = __assign(__assign({}, partialContext), { typename: typename, storeObject: storeObject, readField: partialContext && partialContext.readField || function () {
                    var options = normalizeReadFieldOptions(arguments, storeObject);
                    return policies.readField(options, {
                        store: policies.cache["data"],
                        variables: options.variables,
                    });
                } });
            var id;
            var policy = typename && this.getTypePolicy(typename);
            var keyFn = policy && policy.keyFn || this.config.dataIdFromObject;
            while (keyFn) {
                var specifierOrId = keyFn(object, context);
                if (isArray(specifierOrId)) {
                    keyFn = keyFieldsFnFromSpecifier(specifierOrId);
                }
                else {
                    id = specifierOrId;
                    break;
                }
            }
            id = id ? String(id) : void 0;
            return context.keyObject ? [id, context.keyObject] : [id];
        };
        Policies.prototype.addTypePolicies = function (typePolicies) {
            var _this = this;
            Object.keys(typePolicies).forEach(function (typename) {
                var _a = typePolicies[typename], queryType = _a.queryType, mutationType = _a.mutationType, subscriptionType = _a.subscriptionType, incoming = __rest(_a, ["queryType", "mutationType", "subscriptionType"]);
                if (queryType)
                    _this.setRootTypename("Query", typename);
                if (mutationType)
                    _this.setRootTypename("Mutation", typename);
                if (subscriptionType)
                    _this.setRootTypename("Subscription", typename);
                if (hasOwn.call(_this.toBeAdded, typename)) {
                    _this.toBeAdded[typename].push(incoming);
                }
                else {
                    _this.toBeAdded[typename] = [incoming];
                }
            });
        };
        Policies.prototype.updateTypePolicy = function (typename, incoming) {
            var _this = this;
            var existing = this.getTypePolicy(typename);
            var keyFields = incoming.keyFields, fields = incoming.fields;
            function setMerge(existing, merge) {
                existing.merge =
                    typeof merge === "function" ? merge :
                        merge === true ? mergeTrueFn :
                            merge === false ? mergeFalseFn :
                                existing.merge;
            }
            setMerge(existing, incoming.merge);
            existing.keyFn =
                keyFields === false ? nullKeyFieldsFn :
                    isArray(keyFields) ? keyFieldsFnFromSpecifier(keyFields) :
                        typeof keyFields === "function" ? keyFields :
                            existing.keyFn;
            if (fields) {
                Object.keys(fields).forEach(function (fieldName) {
                    var existing = _this.getFieldPolicy(typename, fieldName, true);
                    var incoming = fields[fieldName];
                    if (typeof incoming === "function") {
                        existing.read = incoming;
                    }
                    else {
                        var keyArgs = incoming.keyArgs, read = incoming.read, merge = incoming.merge;
                        existing.keyFn =
                            keyArgs === false ? simpleKeyArgsFn :
                                isArray(keyArgs) ? keyArgsFnFromSpecifier(keyArgs) :
                                    typeof keyArgs === "function" ? keyArgs :
                                        existing.keyFn;
                        if (typeof read === "function") {
                            existing.read = read;
                        }
                        setMerge(existing, merge);
                    }
                    if (existing.read && existing.merge) {
                        existing.keyFn = existing.keyFn || simpleKeyArgsFn;
                    }
                });
            }
        };
        Policies.prototype.setRootTypename = function (which, typename) {
            if (typename === void 0) { typename = which; }
            var rootId = "ROOT_" + which.toUpperCase();
            var old = this.rootTypenamesById[rootId];
            if (typename !== old) {
                __DEV__ ? invariant$1(!old || old === which, "Cannot change root ".concat(which, " __typename more than once")) : invariant$1(!old || old === which, 3);
                if (old)
                    delete this.rootIdsByTypename[old];
                this.rootIdsByTypename[typename] = rootId;
                this.rootTypenamesById[rootId] = typename;
            }
        };
        Policies.prototype.addPossibleTypes = function (possibleTypes) {
            var _this = this;
            this.usingPossibleTypes = true;
            Object.keys(possibleTypes).forEach(function (supertype) {
                _this.getSupertypeSet(supertype, true);
                possibleTypes[supertype].forEach(function (subtype) {
                    _this.getSupertypeSet(subtype, true).add(supertype);
                    var match = subtype.match(TypeOrFieldNameRegExp);
                    if (!match || match[0] !== subtype) {
                        _this.fuzzySubtypes.set(subtype, new RegExp(subtype));
                    }
                });
            });
        };
        Policies.prototype.getTypePolicy = function (typename) {
            var _this = this;
            if (!hasOwn.call(this.typePolicies, typename)) {
                var policy_1 = this.typePolicies[typename] = Object.create(null);
                policy_1.fields = Object.create(null);
                var supertypes = this.supertypeMap.get(typename);
                if (supertypes && supertypes.size) {
                    supertypes.forEach(function (supertype) {
                        var _a = _this.getTypePolicy(supertype), fields = _a.fields, rest = __rest(_a, ["fields"]);
                        Object.assign(policy_1, rest);
                        Object.assign(policy_1.fields, fields);
                    });
                }
            }
            var inbox = this.toBeAdded[typename];
            if (inbox && inbox.length) {
                inbox.splice(0).forEach(function (policy) {
                    _this.updateTypePolicy(typename, policy);
                });
            }
            return this.typePolicies[typename];
        };
        Policies.prototype.getFieldPolicy = function (typename, fieldName, createIfMissing) {
            if (typename) {
                var fieldPolicies = this.getTypePolicy(typename).fields;
                return fieldPolicies[fieldName] || (createIfMissing && (fieldPolicies[fieldName] = Object.create(null)));
            }
        };
        Policies.prototype.getSupertypeSet = function (subtype, createIfMissing) {
            var supertypeSet = this.supertypeMap.get(subtype);
            if (!supertypeSet && createIfMissing) {
                this.supertypeMap.set(subtype, supertypeSet = new Set());
            }
            return supertypeSet;
        };
        Policies.prototype.fragmentMatches = function (fragment, typename, result, variables) {
            var _this = this;
            if (!fragment.typeCondition)
                return true;
            if (!typename)
                return false;
            var supertype = fragment.typeCondition.name.value;
            if (typename === supertype)
                return true;
            if (this.usingPossibleTypes &&
                this.supertypeMap.has(supertype)) {
                var typenameSupertypeSet = this.getSupertypeSet(typename, true);
                var workQueue_1 = [typenameSupertypeSet];
                var maybeEnqueue_1 = function (subtype) {
                    var supertypeSet = _this.getSupertypeSet(subtype, false);
                    if (supertypeSet &&
                        supertypeSet.size &&
                        workQueue_1.indexOf(supertypeSet) < 0) {
                        workQueue_1.push(supertypeSet);
                    }
                };
                var needToCheckFuzzySubtypes = !!(result && this.fuzzySubtypes.size);
                var checkingFuzzySubtypes = false;
                for (var i = 0; i < workQueue_1.length; ++i) {
                    var supertypeSet = workQueue_1[i];
                    if (supertypeSet.has(supertype)) {
                        if (!typenameSupertypeSet.has(supertype)) {
                            if (checkingFuzzySubtypes) {
                                __DEV__ && invariant$1.warn("Inferring subtype ".concat(typename, " of supertype ").concat(supertype));
                            }
                            typenameSupertypeSet.add(supertype);
                        }
                        return true;
                    }
                    supertypeSet.forEach(maybeEnqueue_1);
                    if (needToCheckFuzzySubtypes &&
                        i === workQueue_1.length - 1 &&
                        selectionSetMatchesResult(fragment.selectionSet, result, variables)) {
                        needToCheckFuzzySubtypes = false;
                        checkingFuzzySubtypes = true;
                        this.fuzzySubtypes.forEach(function (regExp, fuzzyString) {
                            var match = typename.match(regExp);
                            if (match && match[0] === typename) {
                                maybeEnqueue_1(fuzzyString);
                            }
                        });
                    }
                }
            }
            return false;
        };
        Policies.prototype.hasKeyArgs = function (typename, fieldName) {
            var policy = this.getFieldPolicy(typename, fieldName, false);
            return !!(policy && policy.keyFn);
        };
        Policies.prototype.getStoreFieldName = function (fieldSpec) {
            var typename = fieldSpec.typename, fieldName = fieldSpec.fieldName;
            var policy = this.getFieldPolicy(typename, fieldName, false);
            var storeFieldName;
            var keyFn = policy && policy.keyFn;
            if (keyFn && typename) {
                var context = {
                    typename: typename,
                    fieldName: fieldName,
                    field: fieldSpec.field || null,
                    variables: fieldSpec.variables,
                };
                var args = argsFromFieldSpecifier(fieldSpec);
                while (keyFn) {
                    var specifierOrString = keyFn(args, context);
                    if (isArray(specifierOrString)) {
                        keyFn = keyArgsFnFromSpecifier(specifierOrString);
                    }
                    else {
                        storeFieldName = specifierOrString || fieldName;
                        break;
                    }
                }
            }
            if (storeFieldName === void 0) {
                storeFieldName = fieldSpec.field
                    ? storeKeyNameFromField(fieldSpec.field, fieldSpec.variables)
                    : getStoreKeyName(fieldName, argsFromFieldSpecifier(fieldSpec));
            }
            if (storeFieldName === false) {
                return fieldName;
            }
            return fieldName === fieldNameFromStoreName(storeFieldName)
                ? storeFieldName
                : fieldName + ":" + storeFieldName;
        };
        Policies.prototype.readField = function (options, context) {
            var objectOrReference = options.from;
            if (!objectOrReference)
                return;
            var nameOrField = options.field || options.fieldName;
            if (!nameOrField)
                return;
            if (options.typename === void 0) {
                var typename = context.store.getFieldValue(objectOrReference, "__typename");
                if (typename)
                    options.typename = typename;
            }
            var storeFieldName = this.getStoreFieldName(options);
            var fieldName = fieldNameFromStoreName(storeFieldName);
            var existing = context.store.getFieldValue(objectOrReference, storeFieldName);
            var policy = this.getFieldPolicy(options.typename, fieldName, false);
            var read = policy && policy.read;
            if (read) {
                var readOptions = makeFieldFunctionOptions(this, objectOrReference, options, context, context.store.getStorage(isReference(objectOrReference)
                    ? objectOrReference.__ref
                    : objectOrReference, storeFieldName));
                return cacheSlot.withValue(this.cache, read, [existing, readOptions]);
            }
            return existing;
        };
        Policies.prototype.getReadFunction = function (typename, fieldName) {
            var policy = this.getFieldPolicy(typename, fieldName, false);
            return policy && policy.read;
        };
        Policies.prototype.getMergeFunction = function (parentTypename, fieldName, childTypename) {
            var policy = this.getFieldPolicy(parentTypename, fieldName, false);
            var merge = policy && policy.merge;
            if (!merge && childTypename) {
                policy = this.getTypePolicy(childTypename);
                merge = policy && policy.merge;
            }
            return merge;
        };
        Policies.prototype.runMergeFunction = function (existing, incoming, _a, context, storage) {
            var field = _a.field, typename = _a.typename, merge = _a.merge;
            if (merge === mergeTrueFn) {
                return makeMergeObjectsFunction(context.store)(existing, incoming);
            }
            if (merge === mergeFalseFn) {
                return incoming;
            }
            if (context.overwrite) {
                existing = void 0;
            }
            return merge(existing, incoming, makeFieldFunctionOptions(this, void 0, { typename: typename, fieldName: field.name.value, field: field, variables: context.variables }, context, storage || Object.create(null)));
        };
        return Policies;
    }());
    function makeFieldFunctionOptions(policies, objectOrReference, fieldSpec, context, storage) {
        var storeFieldName = policies.getStoreFieldName(fieldSpec);
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var variables = fieldSpec.variables || context.variables;
        var _a = context.store, toReference = _a.toReference, canRead = _a.canRead;
        return {
            args: argsFromFieldSpecifier(fieldSpec),
            field: fieldSpec.field || null,
            fieldName: fieldName,
            storeFieldName: storeFieldName,
            variables: variables,
            isReference: isReference,
            toReference: toReference,
            storage: storage,
            cache: policies.cache,
            canRead: canRead,
            readField: function () {
                return policies.readField(normalizeReadFieldOptions(arguments, objectOrReference, context), context);
            },
            mergeObjects: makeMergeObjectsFunction(context.store),
        };
    }
    function normalizeReadFieldOptions(readFieldArgs, objectOrReference, variables) {
        var fieldNameOrOptions = readFieldArgs[0], from = readFieldArgs[1], argc = readFieldArgs.length;
        var options;
        if (typeof fieldNameOrOptions === "string") {
            options = {
                fieldName: fieldNameOrOptions,
                from: argc > 1 ? from : objectOrReference,
            };
        }
        else {
            options = __assign({}, fieldNameOrOptions);
            if (!hasOwn.call(options, "from")) {
                options.from = objectOrReference;
            }
        }
        if (__DEV__ && options.from === void 0) {
            __DEV__ && invariant$1.warn("Undefined 'from' passed to readField with arguments ".concat(stringifyForDisplay(Array.from(readFieldArgs))));
        }
        if (void 0 === options.variables) {
            options.variables = variables;
        }
        return options;
    }
    function makeMergeObjectsFunction(store) {
        return function mergeObjects(existing, incoming) {
            if (isArray(existing) || isArray(incoming)) {
                throw __DEV__ ? new InvariantError("Cannot automatically merge arrays") : new InvariantError(4);
            }
            if (isNonNullObject(existing) &&
                isNonNullObject(incoming)) {
                var eType = store.getFieldValue(existing, "__typename");
                var iType = store.getFieldValue(incoming, "__typename");
                var typesDiffer = eType && iType && eType !== iType;
                if (typesDiffer) {
                    return incoming;
                }
                if (isReference(existing) &&
                    storeValueIsStoreObject(incoming)) {
                    store.merge(existing.__ref, incoming);
                    return existing;
                }
                if (storeValueIsStoreObject(existing) &&
                    isReference(incoming)) {
                    store.merge(existing, incoming.__ref);
                    return incoming;
                }
                if (storeValueIsStoreObject(existing) &&
                    storeValueIsStoreObject(incoming)) {
                    return __assign(__assign({}, existing), incoming);
                }
            }
            return incoming;
        };
    }

    function getContextFlavor(context, clientOnly, deferred) {
        var key = "".concat(clientOnly).concat(deferred);
        var flavored = context.flavors.get(key);
        if (!flavored) {
            context.flavors.set(key, flavored = (context.clientOnly === clientOnly &&
                context.deferred === deferred) ? context : __assign(__assign({}, context), { clientOnly: clientOnly, deferred: deferred }));
        }
        return flavored;
    }
    var StoreWriter = (function () {
        function StoreWriter(cache, reader) {
            this.cache = cache;
            this.reader = reader;
        }
        StoreWriter.prototype.writeToStore = function (store, _a) {
            var _this = this;
            var query = _a.query, result = _a.result, dataId = _a.dataId, variables = _a.variables, overwrite = _a.overwrite;
            var operationDefinition = getOperationDefinition(query);
            var merger = makeProcessedFieldsMerger();
            variables = __assign(__assign({}, getDefaultValues(operationDefinition)), variables);
            var context = {
                store: store,
                written: Object.create(null),
                merge: function (existing, incoming) {
                    return merger.merge(existing, incoming);
                },
                variables: variables,
                varString: canonicalStringify(variables),
                fragmentMap: createFragmentMap(getFragmentDefinitions(query)),
                overwrite: !!overwrite,
                incomingById: new Map,
                clientOnly: false,
                deferred: false,
                flavors: new Map,
            };
            var ref = this.processSelectionSet({
                result: result || Object.create(null),
                dataId: dataId,
                selectionSet: operationDefinition.selectionSet,
                mergeTree: { map: new Map },
                context: context,
            });
            if (!isReference(ref)) {
                throw __DEV__ ? new InvariantError("Could not identify object ".concat(JSON.stringify(result))) : new InvariantError(6);
            }
            context.incomingById.forEach(function (_a, dataId) {
                var storeObject = _a.storeObject, mergeTree = _a.mergeTree, fieldNodeSet = _a.fieldNodeSet;
                var entityRef = makeReference(dataId);
                if (mergeTree && mergeTree.map.size) {
                    var applied = _this.applyMerges(mergeTree, entityRef, storeObject, context);
                    if (isReference(applied)) {
                        return;
                    }
                    storeObject = applied;
                }
                if (__DEV__ && !context.overwrite) {
                    var fieldsWithSelectionSets_1 = Object.create(null);
                    fieldNodeSet.forEach(function (field) {
                        if (field.selectionSet) {
                            fieldsWithSelectionSets_1[field.name.value] = true;
                        }
                    });
                    var hasSelectionSet_1 = function (storeFieldName) {
                        return fieldsWithSelectionSets_1[fieldNameFromStoreName(storeFieldName)] === true;
                    };
                    var hasMergeFunction_1 = function (storeFieldName) {
                        var childTree = mergeTree && mergeTree.map.get(storeFieldName);
                        return Boolean(childTree && childTree.info && childTree.info.merge);
                    };
                    Object.keys(storeObject).forEach(function (storeFieldName) {
                        if (hasSelectionSet_1(storeFieldName) &&
                            !hasMergeFunction_1(storeFieldName)) {
                            warnAboutDataLoss(entityRef, storeObject, storeFieldName, context.store);
                        }
                    });
                }
                store.merge(dataId, storeObject);
            });
            store.retain(ref.__ref);
            return ref;
        };
        StoreWriter.prototype.processSelectionSet = function (_a) {
            var _this = this;
            var dataId = _a.dataId, result = _a.result, selectionSet = _a.selectionSet, context = _a.context, mergeTree = _a.mergeTree;
            var policies = this.cache.policies;
            var incoming = Object.create(null);
            var typename = (dataId && policies.rootTypenamesById[dataId]) ||
                getTypenameFromResult(result, selectionSet, context.fragmentMap) ||
                (dataId && context.store.get(dataId, "__typename"));
            if ("string" === typeof typename) {
                incoming.__typename = typename;
            }
            var readField = function () {
                var options = normalizeReadFieldOptions(arguments, incoming, context.variables);
                if (isReference(options.from)) {
                    var info = context.incomingById.get(options.from.__ref);
                    if (info) {
                        var result_1 = policies.readField(__assign(__assign({}, options), { from: info.storeObject }), context);
                        if (result_1 !== void 0) {
                            return result_1;
                        }
                    }
                }
                return policies.readField(options, context);
            };
            var fieldNodeSet = new Set();
            this.flattenFields(selectionSet, result, context, typename).forEach(function (context, field) {
                var _a;
                var resultFieldKey = resultKeyNameFromField(field);
                var value = result[resultFieldKey];
                fieldNodeSet.add(field);
                if (value !== void 0) {
                    var storeFieldName = policies.getStoreFieldName({
                        typename: typename,
                        fieldName: field.name.value,
                        field: field,
                        variables: context.variables,
                    });
                    var childTree = getChildMergeTree(mergeTree, storeFieldName);
                    var incomingValue = _this.processFieldValue(value, field, field.selectionSet
                        ? getContextFlavor(context, false, false)
                        : context, childTree);
                    var childTypename = void 0;
                    if (field.selectionSet &&
                        (isReference(incomingValue) ||
                            storeValueIsStoreObject(incomingValue))) {
                        childTypename = readField("__typename", incomingValue);
                    }
                    var merge = policies.getMergeFunction(typename, field.name.value, childTypename);
                    if (merge) {
                        childTree.info = {
                            field: field,
                            typename: typename,
                            merge: merge,
                        };
                    }
                    else {
                        maybeRecycleChildMergeTree(mergeTree, storeFieldName);
                    }
                    incoming = context.merge(incoming, (_a = {},
                        _a[storeFieldName] = incomingValue,
                        _a));
                }
                else if (__DEV__ &&
                    !context.clientOnly &&
                    !context.deferred &&
                    !addTypenameToDocument.added(field) &&
                    !policies.getReadFunction(typename, field.name.value)) {
                    __DEV__ && invariant$1.error("Missing field '".concat(resultKeyNameFromField(field), "' while writing result ").concat(JSON.stringify(result, null, 2)).substring(0, 1000));
                }
            });
            try {
                var _b = policies.identify(result, {
                    typename: typename,
                    selectionSet: selectionSet,
                    fragmentMap: context.fragmentMap,
                    storeObject: incoming,
                    readField: readField,
                }), id = _b[0], keyObject = _b[1];
                dataId = dataId || id;
                if (keyObject) {
                    incoming = context.merge(incoming, keyObject);
                }
            }
            catch (e) {
                if (!dataId)
                    throw e;
            }
            if ("string" === typeof dataId) {
                var dataRef = makeReference(dataId);
                var sets = context.written[dataId] || (context.written[dataId] = []);
                if (sets.indexOf(selectionSet) >= 0)
                    return dataRef;
                sets.push(selectionSet);
                if (this.reader && this.reader.isFresh(result, dataRef, selectionSet, context)) {
                    return dataRef;
                }
                var previous_1 = context.incomingById.get(dataId);
                if (previous_1) {
                    previous_1.storeObject = context.merge(previous_1.storeObject, incoming);
                    previous_1.mergeTree = mergeMergeTrees(previous_1.mergeTree, mergeTree);
                    fieldNodeSet.forEach(function (field) { return previous_1.fieldNodeSet.add(field); });
                }
                else {
                    context.incomingById.set(dataId, {
                        storeObject: incoming,
                        mergeTree: mergeTreeIsEmpty(mergeTree) ? void 0 : mergeTree,
                        fieldNodeSet: fieldNodeSet,
                    });
                }
                return dataRef;
            }
            return incoming;
        };
        StoreWriter.prototype.processFieldValue = function (value, field, context, mergeTree) {
            var _this = this;
            if (!field.selectionSet || value === null) {
                return __DEV__ ? cloneDeep(value) : value;
            }
            if (isArray(value)) {
                return value.map(function (item, i) {
                    var value = _this.processFieldValue(item, field, context, getChildMergeTree(mergeTree, i));
                    maybeRecycleChildMergeTree(mergeTree, i);
                    return value;
                });
            }
            return this.processSelectionSet({
                result: value,
                selectionSet: field.selectionSet,
                context: context,
                mergeTree: mergeTree,
            });
        };
        StoreWriter.prototype.flattenFields = function (selectionSet, result, context, typename) {
            if (typename === void 0) { typename = getTypenameFromResult(result, selectionSet, context.fragmentMap); }
            var fieldMap = new Map();
            var policies = this.cache.policies;
            var limitingTrie = new Trie(false);
            (function flatten(selectionSet, inheritedContext) {
                var visitedNode = limitingTrie.lookup(selectionSet, inheritedContext.clientOnly, inheritedContext.deferred);
                if (visitedNode.visited)
                    return;
                visitedNode.visited = true;
                selectionSet.selections.forEach(function (selection) {
                    if (!shouldInclude(selection, context.variables))
                        return;
                    var clientOnly = inheritedContext.clientOnly, deferred = inheritedContext.deferred;
                    if (!(clientOnly && deferred) &&
                        isNonEmptyArray(selection.directives)) {
                        selection.directives.forEach(function (dir) {
                            var name = dir.name.value;
                            if (name === "client")
                                clientOnly = true;
                            if (name === "defer") {
                                var args = argumentsObjectFromField(dir, context.variables);
                                if (!args || args.if !== false) {
                                    deferred = true;
                                }
                            }
                        });
                    }
                    if (isField(selection)) {
                        var existing = fieldMap.get(selection);
                        if (existing) {
                            clientOnly = clientOnly && existing.clientOnly;
                            deferred = deferred && existing.deferred;
                        }
                        fieldMap.set(selection, getContextFlavor(context, clientOnly, deferred));
                    }
                    else {
                        var fragment = getFragmentFromSelection(selection, context.fragmentMap);
                        if (fragment &&
                            policies.fragmentMatches(fragment, typename, result, context.variables)) {
                            flatten(fragment.selectionSet, getContextFlavor(context, clientOnly, deferred));
                        }
                    }
                });
            })(selectionSet, context);
            return fieldMap;
        };
        StoreWriter.prototype.applyMerges = function (mergeTree, existing, incoming, context, getStorageArgs) {
            var _a;
            var _this = this;
            if (mergeTree.map.size && !isReference(incoming)) {
                var e_1 = (!isArray(incoming) &&
                    (isReference(existing) || storeValueIsStoreObject(existing))) ? existing : void 0;
                var i_1 = incoming;
                if (e_1 && !getStorageArgs) {
                    getStorageArgs = [isReference(e_1) ? e_1.__ref : e_1];
                }
                var changedFields_1;
                var getValue_1 = function (from, name) {
                    return isArray(from)
                        ? (typeof name === "number" ? from[name] : void 0)
                        : context.store.getFieldValue(from, String(name));
                };
                mergeTree.map.forEach(function (childTree, storeFieldName) {
                    var eVal = getValue_1(e_1, storeFieldName);
                    var iVal = getValue_1(i_1, storeFieldName);
                    if (void 0 === iVal)
                        return;
                    if (getStorageArgs) {
                        getStorageArgs.push(storeFieldName);
                    }
                    var aVal = _this.applyMerges(childTree, eVal, iVal, context, getStorageArgs);
                    if (aVal !== iVal) {
                        changedFields_1 = changedFields_1 || new Map;
                        changedFields_1.set(storeFieldName, aVal);
                    }
                    if (getStorageArgs) {
                        invariant$1(getStorageArgs.pop() === storeFieldName);
                    }
                });
                if (changedFields_1) {
                    incoming = (isArray(i_1) ? i_1.slice(0) : __assign({}, i_1));
                    changedFields_1.forEach(function (value, name) {
                        incoming[name] = value;
                    });
                }
            }
            if (mergeTree.info) {
                return this.cache.policies.runMergeFunction(existing, incoming, mergeTree.info, context, getStorageArgs && (_a = context.store).getStorage.apply(_a, getStorageArgs));
            }
            return incoming;
        };
        return StoreWriter;
    }());
    var emptyMergeTreePool = [];
    function getChildMergeTree(_a, name) {
        var map = _a.map;
        if (!map.has(name)) {
            map.set(name, emptyMergeTreePool.pop() || { map: new Map });
        }
        return map.get(name);
    }
    function mergeMergeTrees(left, right) {
        if (left === right || !right || mergeTreeIsEmpty(right))
            return left;
        if (!left || mergeTreeIsEmpty(left))
            return right;
        var info = left.info && right.info ? __assign(__assign({}, left.info), right.info) : left.info || right.info;
        var needToMergeMaps = left.map.size && right.map.size;
        var map = needToMergeMaps ? new Map :
            left.map.size ? left.map : right.map;
        var merged = { info: info, map: map };
        if (needToMergeMaps) {
            var remainingRightKeys_1 = new Set(right.map.keys());
            left.map.forEach(function (leftTree, key) {
                merged.map.set(key, mergeMergeTrees(leftTree, right.map.get(key)));
                remainingRightKeys_1.delete(key);
            });
            remainingRightKeys_1.forEach(function (key) {
                merged.map.set(key, mergeMergeTrees(right.map.get(key), left.map.get(key)));
            });
        }
        return merged;
    }
    function mergeTreeIsEmpty(tree) {
        return !tree || !(tree.info || tree.map.size);
    }
    function maybeRecycleChildMergeTree(_a, name) {
        var map = _a.map;
        var childTree = map.get(name);
        if (childTree && mergeTreeIsEmpty(childTree)) {
            emptyMergeTreePool.push(childTree);
            map.delete(name);
        }
    }
    var warnings = new Set();
    function warnAboutDataLoss(existingRef, incomingObj, storeFieldName, store) {
        var getChild = function (objOrRef) {
            var child = store.getFieldValue(objOrRef, storeFieldName);
            return typeof child === "object" && child;
        };
        var existing = getChild(existingRef);
        if (!existing)
            return;
        var incoming = getChild(incomingObj);
        if (!incoming)
            return;
        if (isReference(existing))
            return;
        if (equal(existing, incoming))
            return;
        if (Object.keys(existing).every(function (key) { return store.getFieldValue(incoming, key) !== void 0; })) {
            return;
        }
        var parentType = store.getFieldValue(existingRef, "__typename") ||
            store.getFieldValue(incomingObj, "__typename");
        var fieldName = fieldNameFromStoreName(storeFieldName);
        var typeDotName = "".concat(parentType, ".").concat(fieldName);
        if (warnings.has(typeDotName))
            return;
        warnings.add(typeDotName);
        var childTypenames = [];
        if (!isArray(existing) &&
            !isArray(incoming)) {
            [existing, incoming].forEach(function (child) {
                var typename = store.getFieldValue(child, "__typename");
                if (typeof typename === "string" &&
                    !childTypenames.includes(typename)) {
                    childTypenames.push(typename);
                }
            });
        }
        __DEV__ && invariant$1.warn("Cache data may be lost when replacing the ".concat(fieldName, " field of a ").concat(parentType, " object.\n\nTo address this problem (which is not a bug in Apollo Client), ").concat(childTypenames.length
            ? "either ensure all objects of type " +
                childTypenames.join(" and ") + " have an ID or a custom merge function, or "
            : "", "define a custom merge function for the ").concat(typeDotName, " field, so InMemoryCache can safely merge these objects:\n\n  existing: ").concat(JSON.stringify(existing).slice(0, 1000), "\n  incoming: ").concat(JSON.stringify(incoming).slice(0, 1000), "\n\nFor more information about these options, please refer to the documentation:\n\n  * Ensuring entity objects have IDs: https://go.apollo.dev/c/generating-unique-identifiers\n  * Defining custom merge functions: https://go.apollo.dev/c/merging-non-normalized-objects\n"));
    }

    var InMemoryCache = (function (_super) {
        __extends(InMemoryCache, _super);
        function InMemoryCache(config) {
            if (config === void 0) { config = {}; }
            var _this = _super.call(this) || this;
            _this.watches = new Set();
            _this.typenameDocumentCache = new Map();
            _this.makeVar = makeVar;
            _this.txCount = 0;
            _this.config = normalizeConfig(config);
            _this.addTypename = !!_this.config.addTypename;
            _this.policies = new Policies({
                cache: _this,
                dataIdFromObject: _this.config.dataIdFromObject,
                possibleTypes: _this.config.possibleTypes,
                typePolicies: _this.config.typePolicies,
            });
            _this.init();
            return _this;
        }
        InMemoryCache.prototype.init = function () {
            var rootStore = this.data = new EntityStore.Root({
                policies: this.policies,
                resultCaching: this.config.resultCaching,
            });
            this.optimisticData = rootStore.stump;
            this.resetResultCache();
        };
        InMemoryCache.prototype.resetResultCache = function (resetResultIdentities) {
            var _this = this;
            var previousReader = this.storeReader;
            this.storeWriter = new StoreWriter(this, this.storeReader = new StoreReader({
                cache: this,
                addTypename: this.addTypename,
                resultCacheMaxSize: this.config.resultCacheMaxSize,
                canonizeResults: shouldCanonizeResults(this.config),
                canon: resetResultIdentities
                    ? void 0
                    : previousReader && previousReader.canon,
            }));
            this.maybeBroadcastWatch = wrap(function (c, options) {
                return _this.broadcastWatch(c, options);
            }, {
                max: this.config.resultCacheMaxSize,
                makeCacheKey: function (c) {
                    var store = c.optimistic ? _this.optimisticData : _this.data;
                    if (supportsResultCaching(store)) {
                        var optimistic = c.optimistic, rootId = c.rootId, variables = c.variables;
                        return store.makeCacheKey(c.query, c.callback, canonicalStringify({ optimistic: optimistic, rootId: rootId, variables: variables }));
                    }
                }
            });
            new Set([
                this.data.group,
                this.optimisticData.group,
            ]).forEach(function (group) { return group.resetCaching(); });
        };
        InMemoryCache.prototype.restore = function (data) {
            this.init();
            if (data)
                this.data.replace(data);
            return this;
        };
        InMemoryCache.prototype.extract = function (optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return (optimistic ? this.optimisticData : this.data).extract();
        };
        InMemoryCache.prototype.read = function (options) {
            var _a = options.returnPartialData, returnPartialData = _a === void 0 ? false : _a;
            try {
                return this.storeReader.diffQueryAgainstStore(__assign(__assign({}, options), { store: options.optimistic ? this.optimisticData : this.data, config: this.config, returnPartialData: returnPartialData })).result || null;
            }
            catch (e) {
                if (e instanceof MissingFieldError) {
                    return null;
                }
                throw e;
            }
        };
        InMemoryCache.prototype.write = function (options) {
            try {
                ++this.txCount;
                return this.storeWriter.writeToStore(this.data, options);
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.modify = function (options) {
            if (hasOwn.call(options, "id") && !options.id) {
                return false;
            }
            var store = options.optimistic
                ? this.optimisticData
                : this.data;
            try {
                ++this.txCount;
                return store.modify(options.id || "ROOT_QUERY", options.fields);
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.diff = function (options) {
            return this.storeReader.diffQueryAgainstStore(__assign(__assign({}, options), { store: options.optimistic ? this.optimisticData : this.data, rootId: options.id || "ROOT_QUERY", config: this.config }));
        };
        InMemoryCache.prototype.watch = function (watch) {
            var _this = this;
            if (!this.watches.size) {
                recallCache(this);
            }
            this.watches.add(watch);
            if (watch.immediate) {
                this.maybeBroadcastWatch(watch);
            }
            return function () {
                if (_this.watches.delete(watch) && !_this.watches.size) {
                    forgetCache(_this);
                }
                _this.maybeBroadcastWatch.forget(watch);
            };
        };
        InMemoryCache.prototype.gc = function (options) {
            canonicalStringify.reset();
            var ids = this.optimisticData.gc();
            if (options && !this.txCount) {
                if (options.resetResultCache) {
                    this.resetResultCache(options.resetResultIdentities);
                }
                else if (options.resetResultIdentities) {
                    this.storeReader.resetCanon();
                }
            }
            return ids;
        };
        InMemoryCache.prototype.retain = function (rootId, optimistic) {
            return (optimistic ? this.optimisticData : this.data).retain(rootId);
        };
        InMemoryCache.prototype.release = function (rootId, optimistic) {
            return (optimistic ? this.optimisticData : this.data).release(rootId);
        };
        InMemoryCache.prototype.identify = function (object) {
            if (isReference(object))
                return object.__ref;
            try {
                return this.policies.identify(object)[0];
            }
            catch (e) {
                __DEV__ && invariant$1.warn(e);
            }
        };
        InMemoryCache.prototype.evict = function (options) {
            if (!options.id) {
                if (hasOwn.call(options, "id")) {
                    return false;
                }
                options = __assign(__assign({}, options), { id: "ROOT_QUERY" });
            }
            try {
                ++this.txCount;
                return this.optimisticData.evict(options, this.data);
            }
            finally {
                if (!--this.txCount && options.broadcast !== false) {
                    this.broadcastWatches();
                }
            }
        };
        InMemoryCache.prototype.reset = function (options) {
            var _this = this;
            this.init();
            canonicalStringify.reset();
            if (options && options.discardWatches) {
                this.watches.forEach(function (watch) { return _this.maybeBroadcastWatch.forget(watch); });
                this.watches.clear();
                forgetCache(this);
            }
            else {
                this.broadcastWatches();
            }
            return Promise.resolve();
        };
        InMemoryCache.prototype.removeOptimistic = function (idToRemove) {
            var newOptimisticData = this.optimisticData.removeLayer(idToRemove);
            if (newOptimisticData !== this.optimisticData) {
                this.optimisticData = newOptimisticData;
                this.broadcastWatches();
            }
        };
        InMemoryCache.prototype.batch = function (options) {
            var _this = this;
            var update = options.update, _a = options.optimistic, optimistic = _a === void 0 ? true : _a, removeOptimistic = options.removeOptimistic, onWatchUpdated = options.onWatchUpdated;
            var updateResult;
            var perform = function (layer) {
                var _a = _this, data = _a.data, optimisticData = _a.optimisticData;
                ++_this.txCount;
                if (layer) {
                    _this.data = _this.optimisticData = layer;
                }
                try {
                    return updateResult = update(_this);
                }
                finally {
                    --_this.txCount;
                    _this.data = data;
                    _this.optimisticData = optimisticData;
                }
            };
            var alreadyDirty = new Set();
            if (onWatchUpdated && !this.txCount) {
                this.broadcastWatches(__assign(__assign({}, options), { onWatchUpdated: function (watch) {
                        alreadyDirty.add(watch);
                        return false;
                    } }));
            }
            if (typeof optimistic === 'string') {
                this.optimisticData = this.optimisticData.addLayer(optimistic, perform);
            }
            else if (optimistic === false) {
                perform(this.data);
            }
            else {
                perform();
            }
            if (typeof removeOptimistic === "string") {
                this.optimisticData = this.optimisticData.removeLayer(removeOptimistic);
            }
            if (onWatchUpdated && alreadyDirty.size) {
                this.broadcastWatches(__assign(__assign({}, options), { onWatchUpdated: function (watch, diff) {
                        var result = onWatchUpdated.call(this, watch, diff);
                        if (result !== false) {
                            alreadyDirty.delete(watch);
                        }
                        return result;
                    } }));
                if (alreadyDirty.size) {
                    alreadyDirty.forEach(function (watch) { return _this.maybeBroadcastWatch.dirty(watch); });
                }
            }
            else {
                this.broadcastWatches(options);
            }
            return updateResult;
        };
        InMemoryCache.prototype.performTransaction = function (update, optimisticId) {
            return this.batch({
                update: update,
                optimistic: optimisticId || (optimisticId !== null),
            });
        };
        InMemoryCache.prototype.transformDocument = function (document) {
            if (this.addTypename) {
                var result = this.typenameDocumentCache.get(document);
                if (!result) {
                    result = addTypenameToDocument(document);
                    this.typenameDocumentCache.set(document, result);
                    this.typenameDocumentCache.set(result, result);
                }
                return result;
            }
            return document;
        };
        InMemoryCache.prototype.broadcastWatches = function (options) {
            var _this = this;
            if (!this.txCount) {
                this.watches.forEach(function (c) { return _this.maybeBroadcastWatch(c, options); });
            }
        };
        InMemoryCache.prototype.broadcastWatch = function (c, options) {
            var lastDiff = c.lastDiff;
            var diff = this.diff(c);
            if (options) {
                if (c.optimistic &&
                    typeof options.optimistic === "string") {
                    diff.fromOptimisticTransaction = true;
                }
                if (options.onWatchUpdated &&
                    options.onWatchUpdated.call(this, c, diff, lastDiff) === false) {
                    return;
                }
            }
            if (!lastDiff || !equal(lastDiff.result, diff.result)) {
                c.callback(c.lastDiff = diff, lastDiff);
            }
        };
        return InMemoryCache;
    }(ApolloCache));

    function isApolloError(err) {
        return err.hasOwnProperty('graphQLErrors');
    }
    var generateErrorMessage = function (err) {
        var message = '';
        if (isNonEmptyArray(err.graphQLErrors) || isNonEmptyArray(err.clientErrors)) {
            var errors = (err.graphQLErrors || [])
                .concat(err.clientErrors || []);
            errors.forEach(function (error) {
                var errorMessage = error
                    ? error.message
                    : 'Error message not found.';
                message += "".concat(errorMessage, "\n");
            });
        }
        if (err.networkError) {
            message += "".concat(err.networkError.message, "\n");
        }
        message = message.replace(/\n$/, '');
        return message;
    };
    var ApolloError = (function (_super) {
        __extends(ApolloError, _super);
        function ApolloError(_a) {
            var graphQLErrors = _a.graphQLErrors, clientErrors = _a.clientErrors, networkError = _a.networkError, errorMessage = _a.errorMessage, extraInfo = _a.extraInfo;
            var _this = _super.call(this, errorMessage) || this;
            _this.graphQLErrors = graphQLErrors || [];
            _this.clientErrors = clientErrors || [];
            _this.networkError = networkError || null;
            _this.message = errorMessage || generateErrorMessage(_this);
            _this.extraInfo = extraInfo;
            _this.__proto__ = ApolloError.prototype;
            return _this;
        }
        return ApolloError;
    }(Error));

    var NetworkStatus;
    (function (NetworkStatus) {
        NetworkStatus[NetworkStatus["loading"] = 1] = "loading";
        NetworkStatus[NetworkStatus["setVariables"] = 2] = "setVariables";
        NetworkStatus[NetworkStatus["fetchMore"] = 3] = "fetchMore";
        NetworkStatus[NetworkStatus["refetch"] = 4] = "refetch";
        NetworkStatus[NetworkStatus["poll"] = 6] = "poll";
        NetworkStatus[NetworkStatus["ready"] = 7] = "ready";
        NetworkStatus[NetworkStatus["error"] = 8] = "error";
    })(NetworkStatus || (NetworkStatus = {}));
    function isNetworkRequestInFlight(networkStatus) {
        return networkStatus ? networkStatus < 7 : false;
    }

    var assign = Object.assign, hasOwnProperty$1 = Object.hasOwnProperty;
    var ObservableQuery = (function (_super) {
        __extends(ObservableQuery, _super);
        function ObservableQuery(_a) {
            var queryManager = _a.queryManager, queryInfo = _a.queryInfo, options = _a.options;
            var _this = _super.call(this, function (observer) {
                try {
                    var subObserver = observer._subscription._observer;
                    if (subObserver && !subObserver.error) {
                        subObserver.error = defaultSubscriptionObserverErrorCallback;
                    }
                }
                catch (_a) { }
                var first = !_this.observers.size;
                _this.observers.add(observer);
                var last = _this.last;
                if (last && last.error) {
                    observer.error && observer.error(last.error);
                }
                else if (last && last.result) {
                    observer.next && observer.next(last.result);
                }
                if (first) {
                    _this.reobserve().catch(function () { });
                }
                return function () {
                    if (_this.observers.delete(observer) && !_this.observers.size) {
                        _this.tearDownQuery();
                    }
                };
            }) || this;
            _this.observers = new Set();
            _this.subscriptions = new Set();
            _this.queryInfo = queryInfo;
            _this.queryManager = queryManager;
            _this.isTornDown = false;
            _this.options = __assign({ initialFetchPolicy: options.fetchPolicy || "cache-first" }, options);
            _this.queryId = queryInfo.queryId || queryManager.generateQueryId();
            var opDef = getOperationDefinition(_this.query);
            _this.queryName = opDef && opDef.name && opDef.name.value;
            return _this;
        }
        Object.defineProperty(ObservableQuery.prototype, "query", {
            get: function () {
                return this.queryManager.transform(this.options.query).document;
            },
            enumerable: false,
            configurable: true
        });
        Object.defineProperty(ObservableQuery.prototype, "variables", {
            get: function () {
                return this.options.variables;
            },
            enumerable: false,
            configurable: true
        });
        ObservableQuery.prototype.result = function () {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var observer = {
                    next: function (result) {
                        resolve(result);
                        _this.observers.delete(observer);
                        if (!_this.observers.size) {
                            _this.queryManager.removeQuery(_this.queryId);
                        }
                        setTimeout(function () {
                            subscription.unsubscribe();
                        }, 0);
                    },
                    error: reject,
                };
                var subscription = _this.subscribe(observer);
            });
        };
        ObservableQuery.prototype.getCurrentResult = function (saveAsLastResult) {
            if (saveAsLastResult === void 0) { saveAsLastResult = true; }
            var lastResult = this.getLastResult(true);
            var networkStatus = this.queryInfo.networkStatus ||
                (lastResult && lastResult.networkStatus) ||
                NetworkStatus.ready;
            var result = __assign(__assign({}, lastResult), { loading: isNetworkRequestInFlight(networkStatus), networkStatus: networkStatus });
            var _a = this.options.fetchPolicy, fetchPolicy = _a === void 0 ? "cache-first" : _a;
            if (fetchPolicy === 'network-only' ||
                fetchPolicy === 'no-cache' ||
                fetchPolicy === 'standby' ||
                this.queryManager.transform(this.options.query).hasForcedResolvers) ;
            else {
                var diff = this.queryInfo.getDiff();
                if (diff.complete || this.options.returnPartialData) {
                    result.data = diff.result;
                }
                if (equal(result.data, {})) {
                    result.data = void 0;
                }
                if (diff.complete) {
                    delete result.partial;
                    if (diff.complete &&
                        result.networkStatus === NetworkStatus.loading &&
                        (fetchPolicy === 'cache-first' ||
                            fetchPolicy === 'cache-only')) {
                        result.networkStatus = NetworkStatus.ready;
                        result.loading = false;
                    }
                }
                else {
                    result.partial = true;
                }
                if (__DEV__ &&
                    !diff.complete &&
                    !this.options.partialRefetch &&
                    !result.loading &&
                    !result.data &&
                    !result.error) {
                    logMissingFieldErrors(diff.missing);
                }
            }
            if (saveAsLastResult) {
                this.updateLastResult(result);
            }
            return result;
        };
        ObservableQuery.prototype.isDifferentFromLastResult = function (newResult) {
            return !this.last || !equal(this.last.result, newResult);
        };
        ObservableQuery.prototype.getLast = function (key, variablesMustMatch) {
            var last = this.last;
            if (last &&
                last[key] &&
                (!variablesMustMatch || equal(last.variables, this.variables))) {
                return last[key];
            }
        };
        ObservableQuery.prototype.getLastResult = function (variablesMustMatch) {
            return this.getLast("result", variablesMustMatch);
        };
        ObservableQuery.prototype.getLastError = function (variablesMustMatch) {
            return this.getLast("error", variablesMustMatch);
        };
        ObservableQuery.prototype.resetLastResults = function () {
            delete this.last;
            this.isTornDown = false;
        };
        ObservableQuery.prototype.resetQueryStoreErrors = function () {
            this.queryManager.resetErrors(this.queryId);
        };
        ObservableQuery.prototype.refetch = function (variables) {
            var _a;
            var reobserveOptions = {
                pollInterval: 0,
            };
            var fetchPolicy = this.options.fetchPolicy;
            if (fetchPolicy === 'cache-and-network') {
                reobserveOptions.fetchPolicy = fetchPolicy;
            }
            else if (fetchPolicy === 'no-cache') {
                reobserveOptions.fetchPolicy = 'no-cache';
            }
            else {
                reobserveOptions.fetchPolicy = 'network-only';
            }
            if (__DEV__ && variables && hasOwnProperty$1.call(variables, "variables")) {
                var queryDef = getQueryDefinition(this.query);
                var vars = queryDef.variableDefinitions;
                if (!vars || !vars.some(function (v) { return v.variable.name.value === "variables"; })) {
                    __DEV__ && invariant$1.warn("Called refetch(".concat(JSON.stringify(variables), ") for query ").concat(((_a = queryDef.name) === null || _a === void 0 ? void 0 : _a.value) || JSON.stringify(queryDef), ", which does not declare a $variables variable.\nDid you mean to call refetch(variables) instead of refetch({ variables })?"));
                }
            }
            if (variables && !equal(this.options.variables, variables)) {
                reobserveOptions.variables = this.options.variables = __assign(__assign({}, this.options.variables), variables);
            }
            this.queryInfo.resetLastWrite();
            return this.reobserve(reobserveOptions, NetworkStatus.refetch);
        };
        ObservableQuery.prototype.fetchMore = function (fetchMoreOptions) {
            var _this = this;
            var combinedOptions = __assign(__assign({}, (fetchMoreOptions.query ? fetchMoreOptions : __assign(__assign(__assign(__assign({}, this.options), { query: this.query }), fetchMoreOptions), { variables: __assign(__assign({}, this.options.variables), fetchMoreOptions.variables) }))), { fetchPolicy: "no-cache" });
            var qid = this.queryManager.generateQueryId();
            var queryInfo = this.queryInfo;
            var originalNetworkStatus = queryInfo.networkStatus;
            queryInfo.networkStatus = NetworkStatus.fetchMore;
            if (combinedOptions.notifyOnNetworkStatusChange) {
                this.observe();
            }
            var updatedQuerySet = new Set();
            return this.queryManager.fetchQuery(qid, combinedOptions, NetworkStatus.fetchMore).then(function (fetchMoreResult) {
                _this.queryManager.removeQuery(qid);
                if (queryInfo.networkStatus === NetworkStatus.fetchMore) {
                    queryInfo.networkStatus = originalNetworkStatus;
                }
                _this.queryManager.cache.batch({
                    update: function (cache) {
                        var updateQuery = fetchMoreOptions.updateQuery;
                        if (updateQuery) {
                            cache.updateQuery({
                                query: _this.query,
                                variables: _this.variables,
                                returnPartialData: true,
                                optimistic: false,
                            }, function (previous) { return updateQuery(previous, {
                                fetchMoreResult: fetchMoreResult.data,
                                variables: combinedOptions.variables,
                            }); });
                        }
                        else {
                            cache.writeQuery({
                                query: combinedOptions.query,
                                variables: combinedOptions.variables,
                                data: fetchMoreResult.data,
                            });
                        }
                    },
                    onWatchUpdated: function (watch) {
                        updatedQuerySet.add(watch.query);
                    },
                });
                return fetchMoreResult;
            }).finally(function () {
                if (!updatedQuerySet.has(_this.query)) {
                    reobserveCacheFirst(_this);
                }
            });
        };
        ObservableQuery.prototype.subscribeToMore = function (options) {
            var _this = this;
            var subscription = this.queryManager
                .startGraphQLSubscription({
                query: options.document,
                variables: options.variables,
                context: options.context,
            })
                .subscribe({
                next: function (subscriptionData) {
                    var updateQuery = options.updateQuery;
                    if (updateQuery) {
                        _this.updateQuery(function (previous, _a) {
                            var variables = _a.variables;
                            return updateQuery(previous, {
                                subscriptionData: subscriptionData,
                                variables: variables,
                            });
                        });
                    }
                },
                error: function (err) {
                    if (options.onError) {
                        options.onError(err);
                        return;
                    }
                    __DEV__ && invariant$1.error('Unhandled GraphQL subscription error', err);
                },
            });
            this.subscriptions.add(subscription);
            return function () {
                if (_this.subscriptions.delete(subscription)) {
                    subscription.unsubscribe();
                }
            };
        };
        ObservableQuery.prototype.setOptions = function (newOptions) {
            return this.reobserve(newOptions);
        };
        ObservableQuery.prototype.setVariables = function (variables) {
            if (equal(this.variables, variables)) {
                return this.observers.size
                    ? this.result()
                    : Promise.resolve();
            }
            this.options.variables = variables;
            if (!this.observers.size) {
                return Promise.resolve();
            }
            return this.reobserve({
                fetchPolicy: this.options.initialFetchPolicy,
                variables: variables,
            }, NetworkStatus.setVariables);
        };
        ObservableQuery.prototype.updateQuery = function (mapFn) {
            var queryManager = this.queryManager;
            var result = queryManager.cache.diff({
                query: this.options.query,
                variables: this.variables,
                returnPartialData: true,
                optimistic: false,
            }).result;
            var newResult = mapFn(result, {
                variables: this.variables,
            });
            if (newResult) {
                queryManager.cache.writeQuery({
                    query: this.options.query,
                    data: newResult,
                    variables: this.variables,
                });
                queryManager.broadcastQueries();
            }
        };
        ObservableQuery.prototype.startPolling = function (pollInterval) {
            this.options.pollInterval = pollInterval;
            this.updatePolling();
        };
        ObservableQuery.prototype.stopPolling = function () {
            this.options.pollInterval = 0;
            this.updatePolling();
        };
        ObservableQuery.prototype.applyNextFetchPolicy = function (reason, options) {
            if (options.nextFetchPolicy) {
                var _a = options.fetchPolicy, fetchPolicy = _a === void 0 ? "cache-first" : _a, _b = options.initialFetchPolicy, initialFetchPolicy = _b === void 0 ? fetchPolicy : _b;
                if (typeof options.nextFetchPolicy === "function") {
                    options.fetchPolicy = options.nextFetchPolicy(fetchPolicy, {
                        reason: reason,
                        options: options,
                        observable: this,
                        initialFetchPolicy: initialFetchPolicy,
                    });
                }
                else if (reason === "variables-changed") {
                    options.fetchPolicy = initialFetchPolicy;
                }
                else {
                    options.fetchPolicy = options.nextFetchPolicy;
                }
            }
            return options.fetchPolicy;
        };
        ObservableQuery.prototype.fetch = function (options, newNetworkStatus) {
            this.queryManager.setObservableQuery(this);
            return this.queryManager.fetchQueryObservable(this.queryId, options, newNetworkStatus);
        };
        ObservableQuery.prototype.updatePolling = function () {
            var _this = this;
            if (this.queryManager.ssrMode) {
                return;
            }
            var _a = this, pollingInfo = _a.pollingInfo, pollInterval = _a.options.pollInterval;
            if (!pollInterval) {
                if (pollingInfo) {
                    clearTimeout(pollingInfo.timeout);
                    delete this.pollingInfo;
                }
                return;
            }
            if (pollingInfo &&
                pollingInfo.interval === pollInterval) {
                return;
            }
            __DEV__ ? invariant$1(pollInterval, 'Attempted to start a polling query without a polling interval.') : invariant$1(pollInterval, 10);
            var info = pollingInfo || (this.pollingInfo = {});
            info.interval = pollInterval;
            var maybeFetch = function () {
                if (_this.pollingInfo) {
                    if (!isNetworkRequestInFlight(_this.queryInfo.networkStatus)) {
                        _this.reobserve({
                            fetchPolicy: "network-only",
                        }, NetworkStatus.poll).then(poll, poll);
                    }
                    else {
                        poll();
                    }
                }
            };
            var poll = function () {
                var info = _this.pollingInfo;
                if (info) {
                    clearTimeout(info.timeout);
                    info.timeout = setTimeout(maybeFetch, info.interval);
                }
            };
            poll();
        };
        ObservableQuery.prototype.updateLastResult = function (newResult, variables) {
            if (variables === void 0) { variables = this.variables; }
            this.last = __assign(__assign({}, this.last), { result: this.queryManager.assumeImmutableResults
                    ? newResult
                    : cloneDeep(newResult), variables: variables });
            if (!isNonEmptyArray(newResult.errors)) {
                delete this.last.error;
            }
            return this.last;
        };
        ObservableQuery.prototype.reobserve = function (newOptions, newNetworkStatus) {
            var _this = this;
            this.isTornDown = false;
            var useDisposableConcast = newNetworkStatus === NetworkStatus.refetch ||
                newNetworkStatus === NetworkStatus.fetchMore ||
                newNetworkStatus === NetworkStatus.poll;
            var oldVariables = this.options.variables;
            var oldFetchPolicy = this.options.fetchPolicy;
            var mergedOptions = mergeOptions(this.options, newOptions || {});
            var options = useDisposableConcast
                ? mergedOptions
                : assign(this.options, mergedOptions);
            if (!useDisposableConcast) {
                this.updatePolling();
                if (newOptions &&
                    newOptions.variables &&
                    !equal(newOptions.variables, oldVariables) &&
                    (!newOptions.fetchPolicy || newOptions.fetchPolicy === oldFetchPolicy)) {
                    this.applyNextFetchPolicy("variables-changed", options);
                    if (newNetworkStatus === void 0) {
                        newNetworkStatus = NetworkStatus.setVariables;
                    }
                }
            }
            var variables = options.variables && __assign({}, options.variables);
            var concast = this.fetch(options, newNetworkStatus);
            var observer = {
                next: function (result) {
                    _this.reportResult(result, variables);
                },
                error: function (error) {
                    _this.reportError(error, variables);
                },
            };
            if (!useDisposableConcast) {
                if (this.concast && this.observer) {
                    this.concast.removeObserver(this.observer, true);
                }
                this.concast = concast;
                this.observer = observer;
            }
            concast.addObserver(observer);
            return concast.promise;
        };
        ObservableQuery.prototype.observe = function () {
            this.reportResult(this.getCurrentResult(false), this.variables);
        };
        ObservableQuery.prototype.reportResult = function (result, variables) {
            var lastError = this.getLastError();
            if (lastError || this.isDifferentFromLastResult(result)) {
                if (lastError || !result.partial || this.options.returnPartialData) {
                    this.updateLastResult(result, variables);
                }
                iterateObserversSafely(this.observers, 'next', result);
            }
        };
        ObservableQuery.prototype.reportError = function (error, variables) {
            var errorResult = __assign(__assign({}, this.getLastResult()), { error: error, errors: error.graphQLErrors, networkStatus: NetworkStatus.error, loading: false });
            this.updateLastResult(errorResult, variables);
            iterateObserversSafely(this.observers, 'error', this.last.error = error);
        };
        ObservableQuery.prototype.hasObservers = function () {
            return this.observers.size > 0;
        };
        ObservableQuery.prototype.tearDownQuery = function () {
            if (this.isTornDown)
                return;
            if (this.concast && this.observer) {
                this.concast.removeObserver(this.observer);
                delete this.concast;
                delete this.observer;
            }
            this.stopPolling();
            this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
            this.subscriptions.clear();
            this.queryManager.stopQuery(this.queryId);
            this.observers.clear();
            this.isTornDown = true;
        };
        return ObservableQuery;
    }(Observable));
    fixObservableSubclass(ObservableQuery);
    function reobserveCacheFirst(obsQuery) {
        var _a = obsQuery.options, fetchPolicy = _a.fetchPolicy, nextFetchPolicy = _a.nextFetchPolicy;
        if (fetchPolicy === "cache-and-network" ||
            fetchPolicy === "network-only") {
            return obsQuery.reobserve({
                fetchPolicy: "cache-first",
                nextFetchPolicy: function () {
                    this.nextFetchPolicy = nextFetchPolicy;
                    if (typeof nextFetchPolicy === "function") {
                        return nextFetchPolicy.apply(this, arguments);
                    }
                    return fetchPolicy;
                },
            });
        }
        return obsQuery.reobserve();
    }
    function defaultSubscriptionObserverErrorCallback(error) {
        __DEV__ && invariant$1.error('Unhandled error', error.message, error.stack);
    }
    function logMissingFieldErrors(missing) {
        if (__DEV__ && missing) {
            __DEV__ && invariant$1.debug("Missing cache result fields: ".concat(JSON.stringify(missing)), missing);
        }
    }

    var LocalState = (function () {
        function LocalState(_a) {
            var cache = _a.cache, client = _a.client, resolvers = _a.resolvers, fragmentMatcher = _a.fragmentMatcher;
            this.cache = cache;
            if (client) {
                this.client = client;
            }
            if (resolvers) {
                this.addResolvers(resolvers);
            }
            if (fragmentMatcher) {
                this.setFragmentMatcher(fragmentMatcher);
            }
        }
        LocalState.prototype.addResolvers = function (resolvers) {
            var _this = this;
            this.resolvers = this.resolvers || {};
            if (Array.isArray(resolvers)) {
                resolvers.forEach(function (resolverGroup) {
                    _this.resolvers = mergeDeep(_this.resolvers, resolverGroup);
                });
            }
            else {
                this.resolvers = mergeDeep(this.resolvers, resolvers);
            }
        };
        LocalState.prototype.setResolvers = function (resolvers) {
            this.resolvers = {};
            this.addResolvers(resolvers);
        };
        LocalState.prototype.getResolvers = function () {
            return this.resolvers || {};
        };
        LocalState.prototype.runResolvers = function (_a) {
            var document = _a.document, remoteResult = _a.remoteResult, context = _a.context, variables = _a.variables, _b = _a.onlyRunForcedResolvers, onlyRunForcedResolvers = _b === void 0 ? false : _b;
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_c) {
                    if (document) {
                        return [2, this.resolveDocument(document, remoteResult.data, context, variables, this.fragmentMatcher, onlyRunForcedResolvers).then(function (localResult) { return (__assign(__assign({}, remoteResult), { data: localResult.result })); })];
                    }
                    return [2, remoteResult];
                });
            });
        };
        LocalState.prototype.setFragmentMatcher = function (fragmentMatcher) {
            this.fragmentMatcher = fragmentMatcher;
        };
        LocalState.prototype.getFragmentMatcher = function () {
            return this.fragmentMatcher;
        };
        LocalState.prototype.clientQuery = function (document) {
            if (hasDirectives(['client'], document)) {
                if (this.resolvers) {
                    return document;
                }
            }
            return null;
        };
        LocalState.prototype.serverQuery = function (document) {
            return removeClientSetsFromDocument(document);
        };
        LocalState.prototype.prepareContext = function (context) {
            var cache = this.cache;
            return __assign(__assign({}, context), { cache: cache, getCacheKey: function (obj) {
                    return cache.identify(obj);
                } });
        };
        LocalState.prototype.addExportedVariables = function (document, variables, context) {
            if (variables === void 0) { variables = {}; }
            if (context === void 0) { context = {}; }
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    if (document) {
                        return [2, this.resolveDocument(document, this.buildRootValueFromCache(document, variables) || {}, this.prepareContext(context), variables).then(function (data) { return (__assign(__assign({}, variables), data.exportedVariables)); })];
                    }
                    return [2, __assign({}, variables)];
                });
            });
        };
        LocalState.prototype.shouldForceResolvers = function (document) {
            var forceResolvers = false;
            visit(document, {
                Directive: {
                    enter: function (node) {
                        if (node.name.value === 'client' && node.arguments) {
                            forceResolvers = node.arguments.some(function (arg) {
                                return arg.name.value === 'always' &&
                                    arg.value.kind === 'BooleanValue' &&
                                    arg.value.value === true;
                            });
                            if (forceResolvers) {
                                return BREAK;
                            }
                        }
                    },
                },
            });
            return forceResolvers;
        };
        LocalState.prototype.buildRootValueFromCache = function (document, variables) {
            return this.cache.diff({
                query: buildQueryFromSelectionSet(document),
                variables: variables,
                returnPartialData: true,
                optimistic: false,
            }).result;
        };
        LocalState.prototype.resolveDocument = function (document, rootValue, context, variables, fragmentMatcher, onlyRunForcedResolvers) {
            if (context === void 0) { context = {}; }
            if (variables === void 0) { variables = {}; }
            if (fragmentMatcher === void 0) { fragmentMatcher = function () { return true; }; }
            if (onlyRunForcedResolvers === void 0) { onlyRunForcedResolvers = false; }
            return __awaiter(this, void 0, void 0, function () {
                var mainDefinition, fragments, fragmentMap, definitionOperation, defaultOperationType, _a, cache, client, execContext;
                return __generator(this, function (_b) {
                    mainDefinition = getMainDefinition(document);
                    fragments = getFragmentDefinitions(document);
                    fragmentMap = createFragmentMap(fragments);
                    definitionOperation = mainDefinition
                        .operation;
                    defaultOperationType = definitionOperation
                        ? definitionOperation.charAt(0).toUpperCase() +
                            definitionOperation.slice(1)
                        : 'Query';
                    _a = this, cache = _a.cache, client = _a.client;
                    execContext = {
                        fragmentMap: fragmentMap,
                        context: __assign(__assign({}, context), { cache: cache, client: client }),
                        variables: variables,
                        fragmentMatcher: fragmentMatcher,
                        defaultOperationType: defaultOperationType,
                        exportedVariables: {},
                        onlyRunForcedResolvers: onlyRunForcedResolvers,
                    };
                    return [2, this.resolveSelectionSet(mainDefinition.selectionSet, rootValue, execContext).then(function (result) { return ({
                            result: result,
                            exportedVariables: execContext.exportedVariables,
                        }); })];
                });
            });
        };
        LocalState.prototype.resolveSelectionSet = function (selectionSet, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var fragmentMap, context, variables, resultsToMerge, execute;
                var _this = this;
                return __generator(this, function (_a) {
                    fragmentMap = execContext.fragmentMap, context = execContext.context, variables = execContext.variables;
                    resultsToMerge = [rootValue];
                    execute = function (selection) { return __awaiter(_this, void 0, void 0, function () {
                        var fragment, typeCondition;
                        return __generator(this, function (_a) {
                            if (!shouldInclude(selection, variables)) {
                                return [2];
                            }
                            if (isField(selection)) {
                                return [2, this.resolveField(selection, rootValue, execContext).then(function (fieldResult) {
                                        var _a;
                                        if (typeof fieldResult !== 'undefined') {
                                            resultsToMerge.push((_a = {},
                                                _a[resultKeyNameFromField(selection)] = fieldResult,
                                                _a));
                                        }
                                    })];
                            }
                            if (isInlineFragment(selection)) {
                                fragment = selection;
                            }
                            else {
                                fragment = fragmentMap[selection.name.value];
                                __DEV__ ? invariant$1(fragment, "No fragment named ".concat(selection.name.value)) : invariant$1(fragment, 9);
                            }
                            if (fragment && fragment.typeCondition) {
                                typeCondition = fragment.typeCondition.name.value;
                                if (execContext.fragmentMatcher(rootValue, typeCondition, context)) {
                                    return [2, this.resolveSelectionSet(fragment.selectionSet, rootValue, execContext).then(function (fragmentResult) {
                                            resultsToMerge.push(fragmentResult);
                                        })];
                                }
                            }
                            return [2];
                        });
                    }); };
                    return [2, Promise.all(selectionSet.selections.map(execute)).then(function () {
                            return mergeDeepArray(resultsToMerge);
                        })];
                });
            });
        };
        LocalState.prototype.resolveField = function (field, rootValue, execContext) {
            return __awaiter(this, void 0, void 0, function () {
                var variables, fieldName, aliasedFieldName, aliasUsed, defaultResult, resultPromise, resolverType, resolverMap, resolve;
                var _this = this;
                return __generator(this, function (_a) {
                    variables = execContext.variables;
                    fieldName = field.name.value;
                    aliasedFieldName = resultKeyNameFromField(field);
                    aliasUsed = fieldName !== aliasedFieldName;
                    defaultResult = rootValue[aliasedFieldName] || rootValue[fieldName];
                    resultPromise = Promise.resolve(defaultResult);
                    if (!execContext.onlyRunForcedResolvers ||
                        this.shouldForceResolvers(field)) {
                        resolverType = rootValue.__typename || execContext.defaultOperationType;
                        resolverMap = this.resolvers && this.resolvers[resolverType];
                        if (resolverMap) {
                            resolve = resolverMap[aliasUsed ? fieldName : aliasedFieldName];
                            if (resolve) {
                                resultPromise = Promise.resolve(cacheSlot.withValue(this.cache, resolve, [
                                    rootValue,
                                    argumentsObjectFromField(field, variables),
                                    execContext.context,
                                    { field: field, fragmentMap: execContext.fragmentMap },
                                ]));
                            }
                        }
                    }
                    return [2, resultPromise.then(function (result) {
                            if (result === void 0) { result = defaultResult; }
                            if (field.directives) {
                                field.directives.forEach(function (directive) {
                                    if (directive.name.value === 'export' && directive.arguments) {
                                        directive.arguments.forEach(function (arg) {
                                            if (arg.name.value === 'as' && arg.value.kind === 'StringValue') {
                                                execContext.exportedVariables[arg.value.value] = result;
                                            }
                                        });
                                    }
                                });
                            }
                            if (!field.selectionSet) {
                                return result;
                            }
                            if (result == null) {
                                return result;
                            }
                            if (Array.isArray(result)) {
                                return _this.resolveSubSelectedArray(field, result, execContext);
                            }
                            if (field.selectionSet) {
                                return _this.resolveSelectionSet(field.selectionSet, result, execContext);
                            }
                        })];
                });
            });
        };
        LocalState.prototype.resolveSubSelectedArray = function (field, result, execContext) {
            var _this = this;
            return Promise.all(result.map(function (item) {
                if (item === null) {
                    return null;
                }
                if (Array.isArray(item)) {
                    return _this.resolveSubSelectedArray(field, item, execContext);
                }
                if (field.selectionSet) {
                    return _this.resolveSelectionSet(field.selectionSet, item, execContext);
                }
            }));
        };
        return LocalState;
    }());

    var destructiveMethodCounts = new (canUseWeakMap ? WeakMap : Map)();
    function wrapDestructiveCacheMethod(cache, methodName) {
        var original = cache[methodName];
        if (typeof original === "function") {
            cache[methodName] = function () {
                destructiveMethodCounts.set(cache, (destructiveMethodCounts.get(cache) + 1) % 1e15);
                return original.apply(this, arguments);
            };
        }
    }
    function cancelNotifyTimeout(info) {
        if (info["notifyTimeout"]) {
            clearTimeout(info["notifyTimeout"]);
            info["notifyTimeout"] = void 0;
        }
    }
    var QueryInfo = (function () {
        function QueryInfo(queryManager, queryId) {
            if (queryId === void 0) { queryId = queryManager.generateQueryId(); }
            this.queryId = queryId;
            this.listeners = new Set();
            this.document = null;
            this.lastRequestId = 1;
            this.subscriptions = new Set();
            this.stopped = false;
            this.dirty = false;
            this.observableQuery = null;
            var cache = this.cache = queryManager.cache;
            if (!destructiveMethodCounts.has(cache)) {
                destructiveMethodCounts.set(cache, 0);
                wrapDestructiveCacheMethod(cache, "evict");
                wrapDestructiveCacheMethod(cache, "modify");
                wrapDestructiveCacheMethod(cache, "reset");
            }
        }
        QueryInfo.prototype.init = function (query) {
            var networkStatus = query.networkStatus || NetworkStatus.loading;
            if (this.variables &&
                this.networkStatus !== NetworkStatus.loading &&
                !equal(this.variables, query.variables)) {
                networkStatus = NetworkStatus.setVariables;
            }
            if (!equal(query.variables, this.variables)) {
                this.lastDiff = void 0;
            }
            Object.assign(this, {
                document: query.document,
                variables: query.variables,
                networkError: null,
                graphQLErrors: this.graphQLErrors || [],
                networkStatus: networkStatus,
            });
            if (query.observableQuery) {
                this.setObservableQuery(query.observableQuery);
            }
            if (query.lastRequestId) {
                this.lastRequestId = query.lastRequestId;
            }
            return this;
        };
        QueryInfo.prototype.reset = function () {
            cancelNotifyTimeout(this);
            this.lastDiff = void 0;
            this.dirty = false;
        };
        QueryInfo.prototype.getDiff = function (variables) {
            if (variables === void 0) { variables = this.variables; }
            var options = this.getDiffOptions(variables);
            if (this.lastDiff && equal(options, this.lastDiff.options)) {
                return this.lastDiff.diff;
            }
            this.updateWatch(this.variables = variables);
            var oq = this.observableQuery;
            if (oq && oq.options.fetchPolicy === "no-cache") {
                return { complete: false };
            }
            var diff = this.cache.diff(options);
            this.updateLastDiff(diff, options);
            return diff;
        };
        QueryInfo.prototype.updateLastDiff = function (diff, options) {
            this.lastDiff = diff ? {
                diff: diff,
                options: options || this.getDiffOptions(),
            } : void 0;
        };
        QueryInfo.prototype.getDiffOptions = function (variables) {
            var _a;
            if (variables === void 0) { variables = this.variables; }
            return {
                query: this.document,
                variables: variables,
                returnPartialData: true,
                optimistic: true,
                canonizeResults: (_a = this.observableQuery) === null || _a === void 0 ? void 0 : _a.options.canonizeResults,
            };
        };
        QueryInfo.prototype.setDiff = function (diff) {
            var _this = this;
            var oldDiff = this.lastDiff && this.lastDiff.diff;
            this.updateLastDiff(diff);
            if (!this.dirty &&
                !equal(oldDiff && oldDiff.result, diff && diff.result)) {
                this.dirty = true;
                if (!this.notifyTimeout) {
                    this.notifyTimeout = setTimeout(function () { return _this.notify(); }, 0);
                }
            }
        };
        QueryInfo.prototype.setObservableQuery = function (oq) {
            var _this = this;
            if (oq === this.observableQuery)
                return;
            if (this.oqListener) {
                this.listeners.delete(this.oqListener);
            }
            this.observableQuery = oq;
            if (oq) {
                oq["queryInfo"] = this;
                this.listeners.add(this.oqListener = function () {
                    var diff = _this.getDiff();
                    if (diff.fromOptimisticTransaction) {
                        oq["observe"]();
                    }
                    else {
                        reobserveCacheFirst(oq);
                    }
                });
            }
            else {
                delete this.oqListener;
            }
        };
        QueryInfo.prototype.notify = function () {
            var _this = this;
            cancelNotifyTimeout(this);
            if (this.shouldNotify()) {
                this.listeners.forEach(function (listener) { return listener(_this); });
            }
            this.dirty = false;
        };
        QueryInfo.prototype.shouldNotify = function () {
            if (!this.dirty || !this.listeners.size) {
                return false;
            }
            if (isNetworkRequestInFlight(this.networkStatus) &&
                this.observableQuery) {
                var fetchPolicy = this.observableQuery.options.fetchPolicy;
                if (fetchPolicy !== "cache-only" &&
                    fetchPolicy !== "cache-and-network") {
                    return false;
                }
            }
            return true;
        };
        QueryInfo.prototype.stop = function () {
            if (!this.stopped) {
                this.stopped = true;
                this.reset();
                this.cancel();
                this.cancel = QueryInfo.prototype.cancel;
                this.subscriptions.forEach(function (sub) { return sub.unsubscribe(); });
                var oq = this.observableQuery;
                if (oq)
                    oq.stopPolling();
            }
        };
        QueryInfo.prototype.cancel = function () { };
        QueryInfo.prototype.updateWatch = function (variables) {
            var _this = this;
            if (variables === void 0) { variables = this.variables; }
            var oq = this.observableQuery;
            if (oq && oq.options.fetchPolicy === "no-cache") {
                return;
            }
            var watchOptions = __assign(__assign({}, this.getDiffOptions(variables)), { watcher: this, callback: function (diff) { return _this.setDiff(diff); } });
            if (!this.lastWatch ||
                !equal(watchOptions, this.lastWatch)) {
                this.cancel();
                this.cancel = this.cache.watch(this.lastWatch = watchOptions);
            }
        };
        QueryInfo.prototype.resetLastWrite = function () {
            this.lastWrite = void 0;
        };
        QueryInfo.prototype.shouldWrite = function (result, variables) {
            var lastWrite = this.lastWrite;
            return !(lastWrite &&
                lastWrite.dmCount === destructiveMethodCounts.get(this.cache) &&
                equal(variables, lastWrite.variables) &&
                equal(result.data, lastWrite.result.data));
        };
        QueryInfo.prototype.markResult = function (result, options, cacheWriteBehavior) {
            var _this = this;
            this.graphQLErrors = isNonEmptyArray(result.errors) ? result.errors : [];
            this.reset();
            if (options.fetchPolicy === 'no-cache') {
                this.updateLastDiff({ result: result.data, complete: true }, this.getDiffOptions(options.variables));
            }
            else if (cacheWriteBehavior !== 0) {
                if (shouldWriteResult(result, options.errorPolicy)) {
                    this.cache.performTransaction(function (cache) {
                        if (_this.shouldWrite(result, options.variables)) {
                            cache.writeQuery({
                                query: _this.document,
                                data: result.data,
                                variables: options.variables,
                                overwrite: cacheWriteBehavior === 1,
                            });
                            _this.lastWrite = {
                                result: result,
                                variables: options.variables,
                                dmCount: destructiveMethodCounts.get(_this.cache),
                            };
                        }
                        else {
                            if (_this.lastDiff &&
                                _this.lastDiff.diff.complete) {
                                result.data = _this.lastDiff.diff.result;
                                return;
                            }
                        }
                        var diffOptions = _this.getDiffOptions(options.variables);
                        var diff = cache.diff(diffOptions);
                        if (!_this.stopped) {
                            _this.updateWatch(options.variables);
                        }
                        _this.updateLastDiff(diff, diffOptions);
                        if (diff.complete) {
                            result.data = diff.result;
                        }
                    });
                }
                else {
                    this.lastWrite = void 0;
                }
            }
        };
        QueryInfo.prototype.markReady = function () {
            this.networkError = null;
            return this.networkStatus = NetworkStatus.ready;
        };
        QueryInfo.prototype.markError = function (error) {
            this.networkStatus = NetworkStatus.error;
            this.lastWrite = void 0;
            this.reset();
            if (error.graphQLErrors) {
                this.graphQLErrors = error.graphQLErrors;
            }
            if (error.networkError) {
                this.networkError = error.networkError;
            }
            return error;
        };
        return QueryInfo;
    }());
    function shouldWriteResult(result, errorPolicy) {
        if (errorPolicy === void 0) { errorPolicy = "none"; }
        var ignoreErrors = errorPolicy === "ignore" ||
            errorPolicy === "all";
        var writeWithErrors = !graphQLResultHasError(result);
        if (!writeWithErrors && ignoreErrors && result.data) {
            writeWithErrors = true;
        }
        return writeWithErrors;
    }

    var hasOwnProperty = Object.prototype.hasOwnProperty;
    var QueryManager = (function () {
        function QueryManager(_a) {
            var cache = _a.cache, link = _a.link, defaultOptions = _a.defaultOptions, _b = _a.queryDeduplication, queryDeduplication = _b === void 0 ? false : _b, onBroadcast = _a.onBroadcast, _c = _a.ssrMode, ssrMode = _c === void 0 ? false : _c, _d = _a.clientAwareness, clientAwareness = _d === void 0 ? {} : _d, localState = _a.localState, assumeImmutableResults = _a.assumeImmutableResults;
            this.clientAwareness = {};
            this.queries = new Map();
            this.fetchCancelFns = new Map();
            this.transformCache = new (canUseWeakMap ? WeakMap : Map)();
            this.queryIdCounter = 1;
            this.requestIdCounter = 1;
            this.mutationIdCounter = 1;
            this.inFlightLinkObservables = new Map();
            this.cache = cache;
            this.link = link;
            this.defaultOptions = defaultOptions || Object.create(null);
            this.queryDeduplication = queryDeduplication;
            this.clientAwareness = clientAwareness;
            this.localState = localState || new LocalState({ cache: cache });
            this.ssrMode = ssrMode;
            this.assumeImmutableResults = !!assumeImmutableResults;
            if ((this.onBroadcast = onBroadcast)) {
                this.mutationStore = Object.create(null);
            }
        }
        QueryManager.prototype.stop = function () {
            var _this = this;
            this.queries.forEach(function (_info, queryId) {
                _this.stopQueryNoBroadcast(queryId);
            });
            this.cancelPendingFetches(__DEV__ ? new InvariantError('QueryManager stopped while query was in flight') : new InvariantError(11));
        };
        QueryManager.prototype.cancelPendingFetches = function (error) {
            this.fetchCancelFns.forEach(function (cancel) { return cancel(error); });
            this.fetchCancelFns.clear();
        };
        QueryManager.prototype.mutate = function (_a) {
            var _b, _c;
            var mutation = _a.mutation, variables = _a.variables, optimisticResponse = _a.optimisticResponse, updateQueries = _a.updateQueries, _d = _a.refetchQueries, refetchQueries = _d === void 0 ? [] : _d, _e = _a.awaitRefetchQueries, awaitRefetchQueries = _e === void 0 ? false : _e, updateWithProxyFn = _a.update, onQueryUpdated = _a.onQueryUpdated, _f = _a.fetchPolicy, fetchPolicy = _f === void 0 ? ((_b = this.defaultOptions.mutate) === null || _b === void 0 ? void 0 : _b.fetchPolicy) || "network-only" : _f, _g = _a.errorPolicy, errorPolicy = _g === void 0 ? ((_c = this.defaultOptions.mutate) === null || _c === void 0 ? void 0 : _c.errorPolicy) || "none" : _g, keepRootFields = _a.keepRootFields, context = _a.context;
            return __awaiter(this, void 0, void 0, function () {
                var mutationId, mutationStoreValue, self;
                return __generator(this, function (_h) {
                    switch (_h.label) {
                        case 0:
                            __DEV__ ? invariant$1(mutation, 'mutation option is required. You must specify your GraphQL document in the mutation option.') : invariant$1(mutation, 12);
                            __DEV__ ? invariant$1(fetchPolicy === 'network-only' ||
                                fetchPolicy === 'no-cache', "Mutations support only 'network-only' or 'no-cache' fetchPolicy strings. The default `network-only` behavior automatically writes mutation results to the cache. Passing `no-cache` skips the cache write.") : invariant$1(fetchPolicy === 'network-only' ||
                                fetchPolicy === 'no-cache', 13);
                            mutationId = this.generateMutationId();
                            mutation = this.transform(mutation).document;
                            variables = this.getVariables(mutation, variables);
                            if (!this.transform(mutation).hasClientExports) return [3, 2];
                            return [4, this.localState.addExportedVariables(mutation, variables, context)];
                        case 1:
                            variables = (_h.sent());
                            _h.label = 2;
                        case 2:
                            mutationStoreValue = this.mutationStore &&
                                (this.mutationStore[mutationId] = {
                                    mutation: mutation,
                                    variables: variables,
                                    loading: true,
                                    error: null,
                                });
                            if (optimisticResponse) {
                                this.markMutationOptimistic(optimisticResponse, {
                                    mutationId: mutationId,
                                    document: mutation,
                                    variables: variables,
                                    fetchPolicy: fetchPolicy,
                                    errorPolicy: errorPolicy,
                                    context: context,
                                    updateQueries: updateQueries,
                                    update: updateWithProxyFn,
                                    keepRootFields: keepRootFields,
                                });
                            }
                            this.broadcastQueries();
                            self = this;
                            return [2, new Promise(function (resolve, reject) {
                                    return asyncMap(self.getObservableFromLink(mutation, __assign(__assign({}, context), { optimisticResponse: optimisticResponse }), variables, false), function (result) {
                                        if (graphQLResultHasError(result) && errorPolicy === 'none') {
                                            throw new ApolloError({
                                                graphQLErrors: result.errors,
                                            });
                                        }
                                        if (mutationStoreValue) {
                                            mutationStoreValue.loading = false;
                                            mutationStoreValue.error = null;
                                        }
                                        var storeResult = __assign({}, result);
                                        if (typeof refetchQueries === "function") {
                                            refetchQueries = refetchQueries(storeResult);
                                        }
                                        if (errorPolicy === 'ignore' &&
                                            graphQLResultHasError(storeResult)) {
                                            delete storeResult.errors;
                                        }
                                        return self.markMutationResult({
                                            mutationId: mutationId,
                                            result: storeResult,
                                            document: mutation,
                                            variables: variables,
                                            fetchPolicy: fetchPolicy,
                                            errorPolicy: errorPolicy,
                                            context: context,
                                            update: updateWithProxyFn,
                                            updateQueries: updateQueries,
                                            awaitRefetchQueries: awaitRefetchQueries,
                                            refetchQueries: refetchQueries,
                                            removeOptimistic: optimisticResponse ? mutationId : void 0,
                                            onQueryUpdated: onQueryUpdated,
                                            keepRootFields: keepRootFields,
                                        });
                                    }).subscribe({
                                        next: function (storeResult) {
                                            self.broadcastQueries();
                                            resolve(storeResult);
                                        },
                                        error: function (err) {
                                            if (mutationStoreValue) {
                                                mutationStoreValue.loading = false;
                                                mutationStoreValue.error = err;
                                            }
                                            if (optimisticResponse) {
                                                self.cache.removeOptimistic(mutationId);
                                            }
                                            self.broadcastQueries();
                                            reject(err instanceof ApolloError ? err : new ApolloError({
                                                networkError: err,
                                            }));
                                        },
                                    });
                                })];
                    }
                });
            });
        };
        QueryManager.prototype.markMutationResult = function (mutation, cache) {
            var _this = this;
            if (cache === void 0) { cache = this.cache; }
            var result = mutation.result;
            var cacheWrites = [];
            var skipCache = mutation.fetchPolicy === "no-cache";
            if (!skipCache && shouldWriteResult(result, mutation.errorPolicy)) {
                cacheWrites.push({
                    result: result.data,
                    dataId: 'ROOT_MUTATION',
                    query: mutation.document,
                    variables: mutation.variables,
                });
                var updateQueries_1 = mutation.updateQueries;
                if (updateQueries_1) {
                    this.queries.forEach(function (_a, queryId) {
                        var observableQuery = _a.observableQuery;
                        var queryName = observableQuery && observableQuery.queryName;
                        if (!queryName || !hasOwnProperty.call(updateQueries_1, queryName)) {
                            return;
                        }
                        var updater = updateQueries_1[queryName];
                        var _b = _this.queries.get(queryId), document = _b.document, variables = _b.variables;
                        var _c = cache.diff({
                            query: document,
                            variables: variables,
                            returnPartialData: true,
                            optimistic: false,
                        }), currentQueryResult = _c.result, complete = _c.complete;
                        if (complete && currentQueryResult) {
                            var nextQueryResult = updater(currentQueryResult, {
                                mutationResult: result,
                                queryName: document && getOperationName(document) || void 0,
                                queryVariables: variables,
                            });
                            if (nextQueryResult) {
                                cacheWrites.push({
                                    result: nextQueryResult,
                                    dataId: 'ROOT_QUERY',
                                    query: document,
                                    variables: variables,
                                });
                            }
                        }
                    });
                }
            }
            if (cacheWrites.length > 0 ||
                mutation.refetchQueries ||
                mutation.update ||
                mutation.onQueryUpdated ||
                mutation.removeOptimistic) {
                var results_1 = [];
                this.refetchQueries({
                    updateCache: function (cache) {
                        if (!skipCache) {
                            cacheWrites.forEach(function (write) { return cache.write(write); });
                        }
                        var update = mutation.update;
                        if (update) {
                            if (!skipCache) {
                                var diff = cache.diff({
                                    id: "ROOT_MUTATION",
                                    query: _this.transform(mutation.document).asQuery,
                                    variables: mutation.variables,
                                    optimistic: false,
                                    returnPartialData: true,
                                });
                                if (diff.complete) {
                                    result = __assign(__assign({}, result), { data: diff.result });
                                }
                            }
                            update(cache, result, {
                                context: mutation.context,
                                variables: mutation.variables,
                            });
                        }
                        if (!skipCache && !mutation.keepRootFields) {
                            cache.modify({
                                id: 'ROOT_MUTATION',
                                fields: function (value, _a) {
                                    var fieldName = _a.fieldName, DELETE = _a.DELETE;
                                    return fieldName === "__typename" ? value : DELETE;
                                },
                            });
                        }
                    },
                    include: mutation.refetchQueries,
                    optimistic: false,
                    removeOptimistic: mutation.removeOptimistic,
                    onQueryUpdated: mutation.onQueryUpdated || null,
                }).forEach(function (result) { return results_1.push(result); });
                if (mutation.awaitRefetchQueries || mutation.onQueryUpdated) {
                    return Promise.all(results_1).then(function () { return result; });
                }
            }
            return Promise.resolve(result);
        };
        QueryManager.prototype.markMutationOptimistic = function (optimisticResponse, mutation) {
            var _this = this;
            var data = typeof optimisticResponse === "function"
                ? optimisticResponse(mutation.variables)
                : optimisticResponse;
            return this.cache.recordOptimisticTransaction(function (cache) {
                try {
                    _this.markMutationResult(__assign(__assign({}, mutation), { result: { data: data } }), cache);
                }
                catch (error) {
                    __DEV__ && invariant$1.error(error);
                }
            }, mutation.mutationId);
        };
        QueryManager.prototype.fetchQuery = function (queryId, options, networkStatus) {
            return this.fetchQueryObservable(queryId, options, networkStatus).promise;
        };
        QueryManager.prototype.getQueryStore = function () {
            var store = Object.create(null);
            this.queries.forEach(function (info, queryId) {
                store[queryId] = {
                    variables: info.variables,
                    networkStatus: info.networkStatus,
                    networkError: info.networkError,
                    graphQLErrors: info.graphQLErrors,
                };
            });
            return store;
        };
        QueryManager.prototype.resetErrors = function (queryId) {
            var queryInfo = this.queries.get(queryId);
            if (queryInfo) {
                queryInfo.networkError = undefined;
                queryInfo.graphQLErrors = [];
            }
        };
        QueryManager.prototype.transform = function (document) {
            var transformCache = this.transformCache;
            if (!transformCache.has(document)) {
                var transformed = this.cache.transformDocument(document);
                var forLink = removeConnectionDirectiveFromDocument(this.cache.transformForLink(transformed));
                var clientQuery = this.localState.clientQuery(transformed);
                var serverQuery = forLink && this.localState.serverQuery(forLink);
                var cacheEntry_1 = {
                    document: transformed,
                    hasClientExports: hasClientExports(transformed),
                    hasForcedResolvers: this.localState.shouldForceResolvers(transformed),
                    clientQuery: clientQuery,
                    serverQuery: serverQuery,
                    defaultVars: getDefaultValues(getOperationDefinition(transformed)),
                    asQuery: __assign(__assign({}, transformed), { definitions: transformed.definitions.map(function (def) {
                            if (def.kind === "OperationDefinition" &&
                                def.operation !== "query") {
                                return __assign(__assign({}, def), { operation: "query" });
                            }
                            return def;
                        }) })
                };
                var add = function (doc) {
                    if (doc && !transformCache.has(doc)) {
                        transformCache.set(doc, cacheEntry_1);
                    }
                };
                add(document);
                add(transformed);
                add(clientQuery);
                add(serverQuery);
            }
            return transformCache.get(document);
        };
        QueryManager.prototype.getVariables = function (document, variables) {
            return __assign(__assign({}, this.transform(document).defaultVars), variables);
        };
        QueryManager.prototype.watchQuery = function (options) {
            options = __assign(__assign({}, options), { variables: this.getVariables(options.query, options.variables) });
            if (typeof options.notifyOnNetworkStatusChange === 'undefined') {
                options.notifyOnNetworkStatusChange = false;
            }
            var queryInfo = new QueryInfo(this);
            var observable = new ObservableQuery({
                queryManager: this,
                queryInfo: queryInfo,
                options: options,
            });
            this.queries.set(observable.queryId, queryInfo);
            queryInfo.init({
                document: observable.query,
                observableQuery: observable,
                variables: observable.variables,
            });
            return observable;
        };
        QueryManager.prototype.query = function (options, queryId) {
            var _this = this;
            if (queryId === void 0) { queryId = this.generateQueryId(); }
            __DEV__ ? invariant$1(options.query, 'query option is required. You must specify your GraphQL document ' +
                'in the query option.') : invariant$1(options.query, 14);
            __DEV__ ? invariant$1(options.query.kind === 'Document', 'You must wrap the query string in a "gql" tag.') : invariant$1(options.query.kind === 'Document', 15);
            __DEV__ ? invariant$1(!options.returnPartialData, 'returnPartialData option only supported on watchQuery.') : invariant$1(!options.returnPartialData, 16);
            __DEV__ ? invariant$1(!options.pollInterval, 'pollInterval option only supported on watchQuery.') : invariant$1(!options.pollInterval, 17);
            return this.fetchQuery(queryId, options).finally(function () { return _this.stopQuery(queryId); });
        };
        QueryManager.prototype.generateQueryId = function () {
            return String(this.queryIdCounter++);
        };
        QueryManager.prototype.generateRequestId = function () {
            return this.requestIdCounter++;
        };
        QueryManager.prototype.generateMutationId = function () {
            return String(this.mutationIdCounter++);
        };
        QueryManager.prototype.stopQueryInStore = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryInStoreNoBroadcast = function (queryId) {
            var queryInfo = this.queries.get(queryId);
            if (queryInfo)
                queryInfo.stop();
        };
        QueryManager.prototype.clearStore = function (options) {
            if (options === void 0) { options = {
                discardWatches: true,
            }; }
            this.cancelPendingFetches(__DEV__ ? new InvariantError('Store reset while query was in flight (not completed in link chain)') : new InvariantError(18));
            this.queries.forEach(function (queryInfo) {
                if (queryInfo.observableQuery) {
                    queryInfo.networkStatus = NetworkStatus.loading;
                }
                else {
                    queryInfo.stop();
                }
            });
            if (this.mutationStore) {
                this.mutationStore = Object.create(null);
            }
            return this.cache.reset(options);
        };
        QueryManager.prototype.getObservableQueries = function (include) {
            var _this = this;
            if (include === void 0) { include = "active"; }
            var queries = new Map();
            var queryNamesAndDocs = new Map();
            var legacyQueryOptions = new Set();
            if (Array.isArray(include)) {
                include.forEach(function (desc) {
                    if (typeof desc === "string") {
                        queryNamesAndDocs.set(desc, false);
                    }
                    else if (isDocumentNode(desc)) {
                        queryNamesAndDocs.set(_this.transform(desc).document, false);
                    }
                    else if (isNonNullObject(desc) && desc.query) {
                        legacyQueryOptions.add(desc);
                    }
                });
            }
            this.queries.forEach(function (_a, queryId) {
                var oq = _a.observableQuery, document = _a.document;
                if (oq) {
                    if (include === "all") {
                        queries.set(queryId, oq);
                        return;
                    }
                    var queryName = oq.queryName, fetchPolicy = oq.options.fetchPolicy;
                    if (fetchPolicy === "standby" ||
                        (include === "active" && !oq.hasObservers())) {
                        return;
                    }
                    if (include === "active" ||
                        (queryName && queryNamesAndDocs.has(queryName)) ||
                        (document && queryNamesAndDocs.has(document))) {
                        queries.set(queryId, oq);
                        if (queryName)
                            queryNamesAndDocs.set(queryName, true);
                        if (document)
                            queryNamesAndDocs.set(document, true);
                    }
                }
            });
            if (legacyQueryOptions.size) {
                legacyQueryOptions.forEach(function (options) {
                    var queryId = makeUniqueId("legacyOneTimeQuery");
                    var queryInfo = _this.getQuery(queryId).init({
                        document: options.query,
                        variables: options.variables,
                    });
                    var oq = new ObservableQuery({
                        queryManager: _this,
                        queryInfo: queryInfo,
                        options: __assign(__assign({}, options), { fetchPolicy: "network-only" }),
                    });
                    invariant$1(oq.queryId === queryId);
                    queryInfo.setObservableQuery(oq);
                    queries.set(queryId, oq);
                });
            }
            if (__DEV__ && queryNamesAndDocs.size) {
                queryNamesAndDocs.forEach(function (included, nameOrDoc) {
                    if (!included) {
                        __DEV__ && invariant$1.warn("Unknown query ".concat(typeof nameOrDoc === "string" ? "named " : "").concat(JSON.stringify(nameOrDoc, null, 2), " requested in refetchQueries options.include array"));
                    }
                });
            }
            return queries;
        };
        QueryManager.prototype.reFetchObservableQueries = function (includeStandby) {
            var _this = this;
            if (includeStandby === void 0) { includeStandby = false; }
            var observableQueryPromises = [];
            this.getObservableQueries(includeStandby ? "all" : "active").forEach(function (observableQuery, queryId) {
                var fetchPolicy = observableQuery.options.fetchPolicy;
                observableQuery.resetLastResults();
                if (includeStandby ||
                    (fetchPolicy !== "standby" &&
                        fetchPolicy !== "cache-only")) {
                    observableQueryPromises.push(observableQuery.refetch());
                }
                _this.getQuery(queryId).setDiff(null);
            });
            this.broadcastQueries();
            return Promise.all(observableQueryPromises);
        };
        QueryManager.prototype.setObservableQuery = function (observableQuery) {
            this.getQuery(observableQuery.queryId).setObservableQuery(observableQuery);
        };
        QueryManager.prototype.startGraphQLSubscription = function (_a) {
            var _this = this;
            var query = _a.query, fetchPolicy = _a.fetchPolicy, errorPolicy = _a.errorPolicy, variables = _a.variables, _b = _a.context, context = _b === void 0 ? {} : _b;
            query = this.transform(query).document;
            variables = this.getVariables(query, variables);
            var makeObservable = function (variables) {
                return _this.getObservableFromLink(query, context, variables).map(function (result) {
                    if (fetchPolicy !== 'no-cache') {
                        if (shouldWriteResult(result, errorPolicy)) {
                            _this.cache.write({
                                query: query,
                                result: result.data,
                                dataId: 'ROOT_SUBSCRIPTION',
                                variables: variables,
                            });
                        }
                        _this.broadcastQueries();
                    }
                    if (graphQLResultHasError(result)) {
                        throw new ApolloError({
                            graphQLErrors: result.errors,
                        });
                    }
                    return result;
                });
            };
            if (this.transform(query).hasClientExports) {
                var observablePromise_1 = this.localState.addExportedVariables(query, variables, context).then(makeObservable);
                return new Observable(function (observer) {
                    var sub = null;
                    observablePromise_1.then(function (observable) { return sub = observable.subscribe(observer); }, observer.error);
                    return function () { return sub && sub.unsubscribe(); };
                });
            }
            return makeObservable(variables);
        };
        QueryManager.prototype.stopQuery = function (queryId) {
            this.stopQueryNoBroadcast(queryId);
            this.broadcastQueries();
        };
        QueryManager.prototype.stopQueryNoBroadcast = function (queryId) {
            this.stopQueryInStoreNoBroadcast(queryId);
            this.removeQuery(queryId);
        };
        QueryManager.prototype.removeQuery = function (queryId) {
            this.fetchCancelFns.delete(queryId);
            if (this.queries.has(queryId)) {
                this.getQuery(queryId).stop();
                this.queries.delete(queryId);
            }
        };
        QueryManager.prototype.broadcastQueries = function () {
            if (this.onBroadcast)
                this.onBroadcast();
            this.queries.forEach(function (info) { return info.notify(); });
        };
        QueryManager.prototype.getLocalState = function () {
            return this.localState;
        };
        QueryManager.prototype.getObservableFromLink = function (query, context, variables, deduplication) {
            var _this = this;
            var _a;
            if (deduplication === void 0) { deduplication = (_a = context === null || context === void 0 ? void 0 : context.queryDeduplication) !== null && _a !== void 0 ? _a : this.queryDeduplication; }
            var observable;
            var serverQuery = this.transform(query).serverQuery;
            if (serverQuery) {
                var _b = this, inFlightLinkObservables_1 = _b.inFlightLinkObservables, link = _b.link;
                var operation = {
                    query: serverQuery,
                    variables: variables,
                    operationName: getOperationName(serverQuery) || void 0,
                    context: this.prepareContext(__assign(__assign({}, context), { forceFetch: !deduplication })),
                };
                context = operation.context;
                if (deduplication) {
                    var byVariables_1 = inFlightLinkObservables_1.get(serverQuery) || new Map();
                    inFlightLinkObservables_1.set(serverQuery, byVariables_1);
                    var varJson_1 = canonicalStringify(variables);
                    observable = byVariables_1.get(varJson_1);
                    if (!observable) {
                        var concast = new Concast([
                            execute(link, operation)
                        ]);
                        byVariables_1.set(varJson_1, observable = concast);
                        concast.cleanup(function () {
                            if (byVariables_1.delete(varJson_1) &&
                                byVariables_1.size < 1) {
                                inFlightLinkObservables_1.delete(serverQuery);
                            }
                        });
                    }
                }
                else {
                    observable = new Concast([
                        execute(link, operation)
                    ]);
                }
            }
            else {
                observable = new Concast([
                    Observable.of({ data: {} })
                ]);
                context = this.prepareContext(context);
            }
            var clientQuery = this.transform(query).clientQuery;
            if (clientQuery) {
                observable = asyncMap(observable, function (result) {
                    return _this.localState.runResolvers({
                        document: clientQuery,
                        remoteResult: result,
                        context: context,
                        variables: variables,
                    });
                });
            }
            return observable;
        };
        QueryManager.prototype.getResultsFromLink = function (queryInfo, cacheWriteBehavior, options) {
            var requestId = queryInfo.lastRequestId = this.generateRequestId();
            return asyncMap(this.getObservableFromLink(queryInfo.document, options.context, options.variables), function (result) {
                var hasErrors = isNonEmptyArray(result.errors);
                if (requestId >= queryInfo.lastRequestId) {
                    if (hasErrors && options.errorPolicy === "none") {
                        throw queryInfo.markError(new ApolloError({
                            graphQLErrors: result.errors,
                        }));
                    }
                    queryInfo.markResult(result, options, cacheWriteBehavior);
                    queryInfo.markReady();
                }
                var aqr = {
                    data: result.data,
                    loading: false,
                    networkStatus: NetworkStatus.ready,
                };
                if (hasErrors && options.errorPolicy !== "ignore") {
                    aqr.errors = result.errors;
                    aqr.networkStatus = NetworkStatus.error;
                }
                return aqr;
            }, function (networkError) {
                var error = isApolloError(networkError)
                    ? networkError
                    : new ApolloError({ networkError: networkError });
                if (requestId >= queryInfo.lastRequestId) {
                    queryInfo.markError(error);
                }
                throw error;
            });
        };
        QueryManager.prototype.fetchQueryObservable = function (queryId, options, networkStatus) {
            var _this = this;
            if (networkStatus === void 0) { networkStatus = NetworkStatus.loading; }
            var query = this.transform(options.query).document;
            var variables = this.getVariables(query, options.variables);
            var queryInfo = this.getQuery(queryId);
            var defaults = this.defaultOptions.watchQuery;
            var _a = options.fetchPolicy, fetchPolicy = _a === void 0 ? defaults && defaults.fetchPolicy || "cache-first" : _a, _b = options.errorPolicy, errorPolicy = _b === void 0 ? defaults && defaults.errorPolicy || "none" : _b, _c = options.returnPartialData, returnPartialData = _c === void 0 ? false : _c, _d = options.notifyOnNetworkStatusChange, notifyOnNetworkStatusChange = _d === void 0 ? false : _d, _e = options.context, context = _e === void 0 ? {} : _e;
            var normalized = Object.assign({}, options, {
                query: query,
                variables: variables,
                fetchPolicy: fetchPolicy,
                errorPolicy: errorPolicy,
                returnPartialData: returnPartialData,
                notifyOnNetworkStatusChange: notifyOnNetworkStatusChange,
                context: context,
            });
            var fromVariables = function (variables) {
                normalized.variables = variables;
                return _this.fetchQueryByPolicy(queryInfo, normalized, networkStatus);
            };
            this.fetchCancelFns.set(queryId, function (reason) {
                setTimeout(function () { return concast.cancel(reason); });
            });
            var concast = new Concast(this.transform(normalized.query).hasClientExports
                ? this.localState.addExportedVariables(normalized.query, normalized.variables, normalized.context).then(fromVariables)
                : fromVariables(normalized.variables));
            concast.cleanup(function () {
                _this.fetchCancelFns.delete(queryId);
                if (queryInfo.observableQuery) {
                    queryInfo.observableQuery["applyNextFetchPolicy"]("after-fetch", options);
                }
            });
            return concast;
        };
        QueryManager.prototype.refetchQueries = function (_a) {
            var _this = this;
            var updateCache = _a.updateCache, include = _a.include, _b = _a.optimistic, optimistic = _b === void 0 ? false : _b, _c = _a.removeOptimistic, removeOptimistic = _c === void 0 ? optimistic ? makeUniqueId("refetchQueries") : void 0 : _c, onQueryUpdated = _a.onQueryUpdated;
            var includedQueriesById = new Map();
            if (include) {
                this.getObservableQueries(include).forEach(function (oq, queryId) {
                    includedQueriesById.set(queryId, {
                        oq: oq,
                        lastDiff: _this.getQuery(queryId).getDiff(),
                    });
                });
            }
            var results = new Map;
            if (updateCache) {
                this.cache.batch({
                    update: updateCache,
                    optimistic: optimistic && removeOptimistic || false,
                    removeOptimistic: removeOptimistic,
                    onWatchUpdated: function (watch, diff, lastDiff) {
                        var oq = watch.watcher instanceof QueryInfo &&
                            watch.watcher.observableQuery;
                        if (oq) {
                            if (onQueryUpdated) {
                                includedQueriesById.delete(oq.queryId);
                                var result = onQueryUpdated(oq, diff, lastDiff);
                                if (result === true) {
                                    result = oq.refetch();
                                }
                                if (result !== false) {
                                    results.set(oq, result);
                                }
                                return result;
                            }
                            if (onQueryUpdated !== null) {
                                includedQueriesById.set(oq.queryId, { oq: oq, lastDiff: lastDiff, diff: diff });
                            }
                        }
                    },
                });
            }
            if (includedQueriesById.size) {
                includedQueriesById.forEach(function (_a, queryId) {
                    var oq = _a.oq, lastDiff = _a.lastDiff, diff = _a.diff;
                    var result;
                    if (onQueryUpdated) {
                        if (!diff) {
                            var info = oq["queryInfo"];
                            info.reset();
                            diff = info.getDiff();
                        }
                        result = onQueryUpdated(oq, diff, lastDiff);
                    }
                    if (!onQueryUpdated || result === true) {
                        result = oq.refetch();
                    }
                    if (result !== false) {
                        results.set(oq, result);
                    }
                    if (queryId.indexOf("legacyOneTimeQuery") >= 0) {
                        _this.stopQueryNoBroadcast(queryId);
                    }
                });
            }
            if (removeOptimistic) {
                this.cache.removeOptimistic(removeOptimistic);
            }
            return results;
        };
        QueryManager.prototype.fetchQueryByPolicy = function (queryInfo, _a, networkStatus) {
            var _this = this;
            var query = _a.query, variables = _a.variables, fetchPolicy = _a.fetchPolicy, refetchWritePolicy = _a.refetchWritePolicy, errorPolicy = _a.errorPolicy, returnPartialData = _a.returnPartialData, context = _a.context, notifyOnNetworkStatusChange = _a.notifyOnNetworkStatusChange, fetchBlockingPromise = _a.fetchBlockingPromise;
            var oldNetworkStatus = queryInfo.networkStatus;
            queryInfo.init({
                document: this.transform(query).document,
                variables: variables,
                networkStatus: networkStatus,
            });
            var readCache = function () { return queryInfo.getDiff(variables); };
            var resultsFromCache = function (diff, networkStatus) {
                if (networkStatus === void 0) { networkStatus = queryInfo.networkStatus || NetworkStatus.loading; }
                var data = diff.result;
                if (__DEV__ &&
                    !returnPartialData &&
                    !equal(data, {})) {
                    logMissingFieldErrors(diff.missing);
                }
                var fromData = function (data) { return Observable.of(__assign({ data: data, loading: isNetworkRequestInFlight(networkStatus), networkStatus: networkStatus }, (diff.complete ? null : { partial: true }))); };
                if (data && _this.transform(query).hasForcedResolvers) {
                    return _this.localState.runResolvers({
                        document: query,
                        remoteResult: { data: data },
                        context: context,
                        variables: variables,
                        onlyRunForcedResolvers: true,
                    }).then(function (resolved) { return fromData(resolved.data || void 0); });
                }
                return fromData(data);
            };
            var cacheWriteBehavior = fetchPolicy === "no-cache" ? 0 :
                (networkStatus === NetworkStatus.refetch &&
                    refetchWritePolicy !== "merge") ? 1
                    : 2;
            var resultsFromLink = function () {
                var get = function () { return _this.getResultsFromLink(queryInfo, cacheWriteBehavior, {
                    variables: variables,
                    context: context,
                    fetchPolicy: fetchPolicy,
                    errorPolicy: errorPolicy,
                }); };
                return fetchBlockingPromise ? fetchBlockingPromise.then(function (ok) { return ok ? get() : Observable.of(); }, function (error) {
                    var apolloError = isApolloError(error)
                        ? error
                        : new ApolloError({ clientErrors: [error] });
                    if (errorPolicy !== "ignore") {
                        queryInfo.markError(apolloError);
                    }
                    return Observable.of({
                        loading: false,
                        networkStatus: NetworkStatus.error,
                        error: apolloError,
                        data: readCache().result,
                    });
                }) : get();
            };
            var shouldNotify = notifyOnNetworkStatusChange &&
                typeof oldNetworkStatus === "number" &&
                oldNetworkStatus !== networkStatus &&
                isNetworkRequestInFlight(networkStatus);
            switch (fetchPolicy) {
                default:
                case "cache-first": {
                    var diff = readCache();
                    if (diff.complete) {
                        return [
                            resultsFromCache(diff, queryInfo.markReady()),
                        ];
                    }
                    if (returnPartialData || shouldNotify) {
                        return [
                            resultsFromCache(diff),
                            resultsFromLink(),
                        ];
                    }
                    return [
                        resultsFromLink(),
                    ];
                }
                case "cache-and-network": {
                    var diff = readCache();
                    if (diff.complete || returnPartialData || shouldNotify) {
                        return [
                            resultsFromCache(diff),
                            resultsFromLink(),
                        ];
                    }
                    return [
                        resultsFromLink(),
                    ];
                }
                case "cache-only":
                    return [
                        resultsFromCache(readCache(), queryInfo.markReady()),
                    ];
                case "network-only":
                    if (shouldNotify) {
                        return [
                            resultsFromCache(readCache()),
                            resultsFromLink(),
                        ];
                    }
                    return [resultsFromLink()];
                case "no-cache":
                    if (shouldNotify) {
                        return [
                            resultsFromCache(queryInfo.getDiff()),
                            resultsFromLink(),
                        ];
                    }
                    return [resultsFromLink()];
                case "standby":
                    return [];
            }
        };
        QueryManager.prototype.getQuery = function (queryId) {
            if (queryId && !this.queries.has(queryId)) {
                this.queries.set(queryId, new QueryInfo(this, queryId));
            }
            return this.queries.get(queryId);
        };
        QueryManager.prototype.prepareContext = function (context) {
            if (context === void 0) { context = {}; }
            var newContext = this.localState.prepareContext(context);
            return __assign(__assign({}, newContext), { clientAwareness: this.clientAwareness });
        };
        return QueryManager;
    }());

    var hasSuggestedDevtools = false;
    var ApolloClient = (function () {
        function ApolloClient(options) {
            var _this = this;
            this.resetStoreCallbacks = [];
            this.clearStoreCallbacks = [];
            var uri = options.uri, credentials = options.credentials, headers = options.headers, cache = options.cache, _a = options.ssrMode, ssrMode = _a === void 0 ? false : _a, _b = options.ssrForceFetchDelay, ssrForceFetchDelay = _b === void 0 ? 0 : _b, _c = options.connectToDevTools, connectToDevTools = _c === void 0 ? typeof window === 'object' &&
                !window.__APOLLO_CLIENT__ &&
                __DEV__ : _c, _d = options.queryDeduplication, queryDeduplication = _d === void 0 ? true : _d, defaultOptions = options.defaultOptions, _e = options.assumeImmutableResults, assumeImmutableResults = _e === void 0 ? false : _e, resolvers = options.resolvers, typeDefs = options.typeDefs, fragmentMatcher = options.fragmentMatcher, clientAwarenessName = options.name, clientAwarenessVersion = options.version;
            var link = options.link;
            if (!link) {
                link = uri
                    ? new HttpLink({ uri: uri, credentials: credentials, headers: headers })
                    : ApolloLink.empty();
            }
            if (!cache) {
                throw __DEV__ ? new InvariantError("To initialize Apollo Client, you must specify a 'cache' property " +
                    "in the options object. \n" +
                    "For more information, please visit: https://go.apollo.dev/c/docs") : new InvariantError(7);
            }
            this.link = link;
            this.cache = cache;
            this.disableNetworkFetches = ssrMode || ssrForceFetchDelay > 0;
            this.queryDeduplication = queryDeduplication;
            this.defaultOptions = defaultOptions || Object.create(null);
            this.typeDefs = typeDefs;
            if (ssrForceFetchDelay) {
                setTimeout(function () { return (_this.disableNetworkFetches = false); }, ssrForceFetchDelay);
            }
            this.watchQuery = this.watchQuery.bind(this);
            this.query = this.query.bind(this);
            this.mutate = this.mutate.bind(this);
            this.resetStore = this.resetStore.bind(this);
            this.reFetchObservableQueries = this.reFetchObservableQueries.bind(this);
            if (connectToDevTools && typeof window === 'object') {
                window.__APOLLO_CLIENT__ = this;
            }
            if (!hasSuggestedDevtools && __DEV__) {
                hasSuggestedDevtools = true;
                if (typeof window !== 'undefined' &&
                    window.document &&
                    window.top === window.self &&
                    !window.__APOLLO_DEVTOOLS_GLOBAL_HOOK__) {
                    var nav = window.navigator;
                    var ua = nav && nav.userAgent;
                    var url = void 0;
                    if (typeof ua === "string") {
                        if (ua.indexOf("Chrome/") > -1) {
                            url = "https://chrome.google.com/webstore/detail/" +
                                "apollo-client-developer-t/jdkknkkbebbapilgoeccciglkfbmbnfm";
                        }
                        else if (ua.indexOf("Firefox/") > -1) {
                            url = "https://addons.mozilla.org/en-US/firefox/addon/apollo-developer-tools/";
                        }
                    }
                    if (url) {
                        __DEV__ && invariant$1.log("Download the Apollo DevTools for a better development " +
                            "experience: " + url);
                    }
                }
            }
            this.version = version;
            this.localState = new LocalState({
                cache: cache,
                client: this,
                resolvers: resolvers,
                fragmentMatcher: fragmentMatcher,
            });
            this.queryManager = new QueryManager({
                cache: this.cache,
                link: this.link,
                defaultOptions: this.defaultOptions,
                queryDeduplication: queryDeduplication,
                ssrMode: ssrMode,
                clientAwareness: {
                    name: clientAwarenessName,
                    version: clientAwarenessVersion,
                },
                localState: this.localState,
                assumeImmutableResults: assumeImmutableResults,
                onBroadcast: connectToDevTools ? function () {
                    if (_this.devToolsHookCb) {
                        _this.devToolsHookCb({
                            action: {},
                            state: {
                                queries: _this.queryManager.getQueryStore(),
                                mutations: _this.queryManager.mutationStore || {},
                            },
                            dataWithOptimisticResults: _this.cache.extract(true),
                        });
                    }
                } : void 0,
            });
        }
        ApolloClient.prototype.stop = function () {
            this.queryManager.stop();
        };
        ApolloClient.prototype.watchQuery = function (options) {
            if (this.defaultOptions.watchQuery) {
                options = mergeOptions(this.defaultOptions.watchQuery, options);
            }
            if (this.disableNetworkFetches &&
                (options.fetchPolicy === 'network-only' ||
                    options.fetchPolicy === 'cache-and-network')) {
                options = __assign(__assign({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.watchQuery(options);
        };
        ApolloClient.prototype.query = function (options) {
            if (this.defaultOptions.query) {
                options = mergeOptions(this.defaultOptions.query, options);
            }
            __DEV__ ? invariant$1(options.fetchPolicy !== 'cache-and-network', 'The cache-and-network fetchPolicy does not work with client.query, because ' +
                'client.query can only return a single result. Please use client.watchQuery ' +
                'to receive multiple results from the cache and the network, or consider ' +
                'using a different fetchPolicy, such as cache-first or network-only.') : invariant$1(options.fetchPolicy !== 'cache-and-network', 8);
            if (this.disableNetworkFetches && options.fetchPolicy === 'network-only') {
                options = __assign(__assign({}, options), { fetchPolicy: 'cache-first' });
            }
            return this.queryManager.query(options);
        };
        ApolloClient.prototype.mutate = function (options) {
            if (this.defaultOptions.mutate) {
                options = mergeOptions(this.defaultOptions.mutate, options);
            }
            return this.queryManager.mutate(options);
        };
        ApolloClient.prototype.subscribe = function (options) {
            return this.queryManager.startGraphQLSubscription(options);
        };
        ApolloClient.prototype.readQuery = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readQuery(options, optimistic);
        };
        ApolloClient.prototype.readFragment = function (options, optimistic) {
            if (optimistic === void 0) { optimistic = false; }
            return this.cache.readFragment(options, optimistic);
        };
        ApolloClient.prototype.writeQuery = function (options) {
            this.cache.writeQuery(options);
            this.queryManager.broadcastQueries();
        };
        ApolloClient.prototype.writeFragment = function (options) {
            this.cache.writeFragment(options);
            this.queryManager.broadcastQueries();
        };
        ApolloClient.prototype.__actionHookForDevTools = function (cb) {
            this.devToolsHookCb = cb;
        };
        ApolloClient.prototype.__requestRaw = function (payload) {
            return execute(this.link, payload);
        };
        ApolloClient.prototype.resetStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore({
                discardWatches: false,
            }); })
                .then(function () { return Promise.all(_this.resetStoreCallbacks.map(function (fn) { return fn(); })); })
                .then(function () { return _this.reFetchObservableQueries(); });
        };
        ApolloClient.prototype.clearStore = function () {
            var _this = this;
            return Promise.resolve()
                .then(function () { return _this.queryManager.clearStore({
                discardWatches: true,
            }); })
                .then(function () { return Promise.all(_this.clearStoreCallbacks.map(function (fn) { return fn(); })); });
        };
        ApolloClient.prototype.onResetStore = function (cb) {
            var _this = this;
            this.resetStoreCallbacks.push(cb);
            return function () {
                _this.resetStoreCallbacks = _this.resetStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.onClearStore = function (cb) {
            var _this = this;
            this.clearStoreCallbacks.push(cb);
            return function () {
                _this.clearStoreCallbacks = _this.clearStoreCallbacks.filter(function (c) { return c !== cb; });
            };
        };
        ApolloClient.prototype.reFetchObservableQueries = function (includeStandby) {
            return this.queryManager.reFetchObservableQueries(includeStandby);
        };
        ApolloClient.prototype.refetchQueries = function (options) {
            var map = this.queryManager.refetchQueries(options);
            var queries = [];
            var results = [];
            map.forEach(function (result, obsQuery) {
                queries.push(obsQuery);
                results.push(result);
            });
            var result = Promise.all(results);
            result.queries = queries;
            result.results = results;
            result.catch(function (error) {
                __DEV__ && invariant$1.debug("In client.refetchQueries, Promise.all promise rejected with error ".concat(error));
            });
            return result;
        };
        ApolloClient.prototype.getObservableQueries = function (include) {
            if (include === void 0) { include = "active"; }
            return this.queryManager.getObservableQueries(include);
        };
        ApolloClient.prototype.extract = function (optimistic) {
            return this.cache.extract(optimistic);
        };
        ApolloClient.prototype.restore = function (serializedState) {
            return this.cache.restore(serializedState);
        };
        ApolloClient.prototype.addResolvers = function (resolvers) {
            this.localState.addResolvers(resolvers);
        };
        ApolloClient.prototype.setResolvers = function (resolvers) {
            this.localState.setResolvers(resolvers);
        };
        ApolloClient.prototype.getResolvers = function () {
            return this.localState.getResolvers();
        };
        ApolloClient.prototype.setLocalStateFragmentMatcher = function (fragmentMatcher) {
            this.localState.setFragmentMatcher(fragmentMatcher);
        };
        ApolloClient.prototype.setLink = function (newLink) {
            this.link = this.queryManager.link = newLink;
        };
        return ApolloClient;
    }());

    var docCache = new Map();
    var fragmentSourceMap = new Map();
    var printFragmentWarnings = true;
    var experimentalFragmentVariables = false;
    function normalize(string) {
        return string.replace(/[\s,]+/g, ' ').trim();
    }
    function cacheKeyFromLoc(loc) {
        return normalize(loc.source.body.substring(loc.start, loc.end));
    }
    function processFragments(ast) {
        var seenKeys = new Set();
        var definitions = [];
        ast.definitions.forEach(function (fragmentDefinition) {
            if (fragmentDefinition.kind === 'FragmentDefinition') {
                var fragmentName = fragmentDefinition.name.value;
                var sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);
                var sourceKeySet = fragmentSourceMap.get(fragmentName);
                if (sourceKeySet && !sourceKeySet.has(sourceKey)) {
                    if (printFragmentWarnings) {
                        console.warn("Warning: fragment with name " + fragmentName + " already exists.\n"
                            + "graphql-tag enforces all fragment names across your application to be unique; read more about\n"
                            + "this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names");
                    }
                }
                else if (!sourceKeySet) {
                    fragmentSourceMap.set(fragmentName, sourceKeySet = new Set);
                }
                sourceKeySet.add(sourceKey);
                if (!seenKeys.has(sourceKey)) {
                    seenKeys.add(sourceKey);
                    definitions.push(fragmentDefinition);
                }
            }
            else {
                definitions.push(fragmentDefinition);
            }
        });
        return __assign(__assign({}, ast), { definitions: definitions });
    }
    function stripLoc(doc) {
        var workSet = new Set(doc.definitions);
        workSet.forEach(function (node) {
            if (node.loc)
                delete node.loc;
            Object.keys(node).forEach(function (key) {
                var value = node[key];
                if (value && typeof value === 'object') {
                    workSet.add(value);
                }
            });
        });
        var loc = doc.loc;
        if (loc) {
            delete loc.startToken;
            delete loc.endToken;
        }
        return doc;
    }
    function parseDocument(source) {
        var cacheKey = normalize(source);
        if (!docCache.has(cacheKey)) {
            var parsed = parse$1(source, {
                experimentalFragmentVariables: experimentalFragmentVariables,
                allowLegacyFragmentVariables: experimentalFragmentVariables
            });
            if (!parsed || parsed.kind !== 'Document') {
                throw new Error('Not a valid GraphQL document.');
            }
            docCache.set(cacheKey, stripLoc(processFragments(parsed)));
        }
        return docCache.get(cacheKey);
    }
    function gql(literals) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        if (typeof literals === 'string') {
            literals = [literals];
        }
        var result = literals[0];
        args.forEach(function (arg, i) {
            if (arg && arg.kind === 'Document') {
                result += arg.loc.source.body;
            }
            else {
                result += arg;
            }
            result += literals[i + 1];
        });
        return parseDocument(result);
    }
    function resetCaches() {
        docCache.clear();
        fragmentSourceMap.clear();
    }
    function disableFragmentWarnings() {
        printFragmentWarnings = false;
    }
    function enableExperimentalFragmentVariables() {
        experimentalFragmentVariables = true;
    }
    function disableExperimentalFragmentVariables() {
        experimentalFragmentVariables = false;
    }
    var extras = {
        gql: gql,
        resetCaches: resetCaches,
        disableFragmentWarnings: disableFragmentWarnings,
        enableExperimentalFragmentVariables: enableExperimentalFragmentVariables,
        disableExperimentalFragmentVariables: disableExperimentalFragmentVariables
    };
    (function (gql_1) {
        gql_1.gql = extras.gql, gql_1.resetCaches = extras.resetCaches, gql_1.disableFragmentWarnings = extras.disableFragmentWarnings, gql_1.enableExperimentalFragmentVariables = extras.enableExperimentalFragmentVariables, gql_1.disableExperimentalFragmentVariables = extras.disableExperimentalFragmentVariables;
    })(gql || (gql = {}));
    gql["default"] = gql;

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop$3) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop$3) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop$3;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const CLIENT = typeof Symbol !== "undefined" ? Symbol("client") : "@@client";
    function getClient() {
        const client = getContext(CLIENT);
        if (!client) {
            throw new Error("ApolloClient has not been set yet, use setClient(new ApolloClient({ ... })) to define it");
        }
        return client;
    }
    function setClient(client) {
        setContext(CLIENT, client);
    }

    function observableToReadable(observable, initialValue = {
        loading: true,
        data: undefined,
        error: undefined,
    }) {
        const store = readable(initialValue, (set) => {
            const skipDuplicate = initialValue?.data !== undefined;
            let skipped = false;
            const subscription = observable.subscribe((result) => {
                if (skipDuplicate && !skipped) {
                    skipped = true;
                    return;
                }
                if (result.errors) {
                    const error = new ApolloError({ graphQLErrors: result.errors });
                    set({ loading: false, data: undefined, error });
                }
                else {
                    set({ loading: false, data: result.data, error: undefined });
                }
            }, (error) => set({
                loading: false,
                data: undefined,
                error: error && "message" in error ? error : new Error(error),
            }));
            return () => subscription.unsubscribe();
        });
        return store;
    }
    const extensions = [
        "fetchMore",
        "getCurrentResult",
        "getLastError",
        "getLastResult",
        "isDifferentFromLastResult",
        "refetch",
        "resetLastResults",
        "resetQueryStoreErrors",
        "result",
        "setOptions",
        "setVariables",
        "startPolling",
        "stopPolling",
        "subscribeToMore",
        "updateQuery",
    ];
    function observableQueryToReadable(query, initialValue) {
        const store = observableToReadable(query, initialValue);
        for (const extension of extensions) {
            store[extension] = query[extension].bind(query);
        }
        return store;
    }

    const restoring = typeof WeakSet !== "undefined" ? new WeakSet() : new Set();

    function query(query, options = {}) {
        const client = getClient();
        const queryOptions = { ...options, query };
        // If client is restoring (e.g. from SSR), attempt synchronous readQuery first
        let initialValue;
        if (restoring.has(client)) {
            try {
                // undefined = skip initial value (not in cache)
                initialValue = client.readQuery(queryOptions) || undefined;
            }
            catch (err) {
                // Ignore preload errors
            }
        }
        const observable = client.watchQuery(queryOptions);
        const store = observableQueryToReadable(observable, initialValue !== undefined
            ? {
                data: initialValue,
            }
            : undefined);
        return store;
    }

    /*!
     * Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     * Copyright 2022 Fonticons, Inc.
     */
    function ownKeys(object, enumerableOnly) {
      var keys = Object.keys(object);

      if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        enumerableOnly && (symbols = symbols.filter(function (sym) {
          return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        })), keys.push.apply(keys, symbols);
      }

      return keys;
    }

    function _objectSpread2(target) {
      for (var i = 1; i < arguments.length; i++) {
        var source = null != arguments[i] ? arguments[i] : {};
        i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }

      return target;
    }

    function _typeof(obj) {
      "@babel/helpers - typeof";

      return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
        return typeof obj;
      } : function (obj) {
        return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      }, _typeof(obj);
    }

    function _classCallCheck(instance, Constructor) {
      if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
      }
    }

    function _defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    function _createClass(Constructor, protoProps, staticProps) {
      if (protoProps) _defineProperties(Constructor.prototype, protoProps);
      if (staticProps) _defineProperties(Constructor, staticProps);
      Object.defineProperty(Constructor, "prototype", {
        writable: false
      });
      return Constructor;
    }

    function _defineProperty(obj, key, value) {
      if (key in obj) {
        Object.defineProperty(obj, key, {
          value: value,
          enumerable: true,
          configurable: true,
          writable: true
        });
      } else {
        obj[key] = value;
      }

      return obj;
    }

    function _slicedToArray(arr, i) {
      return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
    }

    function _toConsumableArray(arr) {
      return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
    }

    function _arrayWithoutHoles(arr) {
      if (Array.isArray(arr)) return _arrayLikeToArray(arr);
    }

    function _arrayWithHoles(arr) {
      if (Array.isArray(arr)) return arr;
    }

    function _iterableToArray(iter) {
      if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
    }

    function _iterableToArrayLimit(arr, i) {
      var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

      if (_i == null) return;
      var _arr = [];
      var _n = true;
      var _d = false;

      var _s, _e;

      try {
        for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
          _arr.push(_s.value);

          if (i && _arr.length === i) break;
        }
      } catch (err) {
        _d = true;
        _e = err;
      } finally {
        try {
          if (!_n && _i["return"] != null) _i["return"]();
        } finally {
          if (_d) throw _e;
        }
      }

      return _arr;
    }

    function _unsupportedIterableToArray(o, minLen) {
      if (!o) return;
      if (typeof o === "string") return _arrayLikeToArray(o, minLen);
      var n = Object.prototype.toString.call(o).slice(8, -1);
      if (n === "Object" && o.constructor) n = o.constructor.name;
      if (n === "Map" || n === "Set") return Array.from(o);
      if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
    }

    function _arrayLikeToArray(arr, len) {
      if (len == null || len > arr.length) len = arr.length;

      for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

      return arr2;
    }

    function _nonIterableSpread() {
      throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    function _nonIterableRest() {
      throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
    }

    var noop = function noop() {};

    var _WINDOW = {};
    var _DOCUMENT = {};
    var _MUTATION_OBSERVER = null;
    var _PERFORMANCE = {
      mark: noop,
      measure: noop
    };

    try {
      if (typeof window !== 'undefined') _WINDOW = window;
      if (typeof document !== 'undefined') _DOCUMENT = document;
      if (typeof MutationObserver !== 'undefined') _MUTATION_OBSERVER = MutationObserver;
      if (typeof performance !== 'undefined') _PERFORMANCE = performance;
    } catch (e) {}

    var _ref = _WINDOW.navigator || {},
        _ref$userAgent = _ref.userAgent,
        userAgent = _ref$userAgent === void 0 ? '' : _ref$userAgent;
    var WINDOW = _WINDOW;
    var DOCUMENT = _DOCUMENT;
    var MUTATION_OBSERVER = _MUTATION_OBSERVER;
    var PERFORMANCE = _PERFORMANCE;
    !!WINDOW.document;
    var IS_DOM = !!DOCUMENT.documentElement && !!DOCUMENT.head && typeof DOCUMENT.addEventListener === 'function' && typeof DOCUMENT.createElement === 'function';
    var IS_IE = ~userAgent.indexOf('MSIE') || ~userAgent.indexOf('Trident/');

    var NAMESPACE_IDENTIFIER = '___FONT_AWESOME___';
    var UNITS_IN_GRID = 16;
    var DEFAULT_FAMILY_PREFIX = 'fa';
    var DEFAULT_REPLACEMENT_CLASS = 'svg-inline--fa';
    var DATA_FA_I2SVG = 'data-fa-i2svg';
    var DATA_FA_PSEUDO_ELEMENT = 'data-fa-pseudo-element';
    var DATA_FA_PSEUDO_ELEMENT_PENDING = 'data-fa-pseudo-element-pending';
    var DATA_PREFIX = 'data-prefix';
    var DATA_ICON = 'data-icon';
    var HTML_CLASS_I2SVG_BASE_CLASS = 'fontawesome-i2svg';
    var MUTATION_APPROACH_ASYNC = 'async';
    var TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS = ['HTML', 'HEAD', 'STYLE', 'SCRIPT'];
    var PRODUCTION = function () {
      try {
        return process.env.NODE_ENV === 'production';
      } catch (e) {
        return false;
      }
    }();
    var PREFIX_TO_STYLE = {
      'fas': 'solid',
      'fa-solid': 'solid',
      'far': 'regular',
      'fa-regular': 'regular',
      'fal': 'light',
      'fa-light': 'light',
      'fat': 'thin',
      'fa-thin': 'thin',
      'fad': 'duotone',
      'fa-duotone': 'duotone',
      'fab': 'brands',
      'fa-brands': 'brands',
      'fak': 'kit',
      'fa-kit': 'kit',
      'fa': 'solid'
    };
    var STYLE_TO_PREFIX = {
      'solid': 'fas',
      'regular': 'far',
      'light': 'fal',
      'thin': 'fat',
      'duotone': 'fad',
      'brands': 'fab',
      'kit': 'fak'
    };
    var PREFIX_TO_LONG_STYLE = {
      'fab': 'fa-brands',
      'fad': 'fa-duotone',
      'fak': 'fa-kit',
      'fal': 'fa-light',
      'far': 'fa-regular',
      'fas': 'fa-solid',
      'fat': 'fa-thin'
    };
    var LONG_STYLE_TO_PREFIX = {
      'fa-brands': 'fab',
      'fa-duotone': 'fad',
      'fa-kit': 'fak',
      'fa-light': 'fal',
      'fa-regular': 'far',
      'fa-solid': 'fas',
      'fa-thin': 'fat'
    };
    var ICON_SELECTION_SYNTAX_PATTERN = /fa[srltdbk\-\ ]/; // eslint-disable-line no-useless-escape

    var LAYERS_TEXT_CLASSNAME = 'fa-layers-text';
    var FONT_FAMILY_PATTERN = /Font ?Awesome ?([56 ]*)(Solid|Regular|Light|Thin|Duotone|Brands|Free|Pro|Kit)?.*/i; // TODO: do we need to handle font-weight for kit SVG pseudo-elements?

    var FONT_WEIGHT_TO_PREFIX = {
      '900': 'fas',
      '400': 'far',
      'normal': 'far',
      '300': 'fal',
      '100': 'fat'
    };
    var oneToTen = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    var oneToTwenty = oneToTen.concat([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    var ATTRIBUTES_WATCHED_FOR_MUTATION = ['class', 'data-prefix', 'data-icon', 'data-fa-transform', 'data-fa-mask'];
    var DUOTONE_CLASSES = {
      GROUP: 'duotone-group',
      SWAP_OPACITY: 'swap-opacity',
      PRIMARY: 'primary',
      SECONDARY: 'secondary'
    };
    var RESERVED_CLASSES = [].concat(_toConsumableArray(Object.keys(STYLE_TO_PREFIX)), ['2xs', 'xs', 'sm', 'lg', 'xl', '2xl', 'beat', 'border', 'fade', 'beat-fade', 'bounce', 'flip-both', 'flip-horizontal', 'flip-vertical', 'flip', 'fw', 'inverse', 'layers-counter', 'layers-text', 'layers', 'li', 'pull-left', 'pull-right', 'pulse', 'rotate-180', 'rotate-270', 'rotate-90', 'rotate-by', 'shake', 'spin-pulse', 'spin-reverse', 'spin', 'stack-1x', 'stack-2x', 'stack', 'ul', DUOTONE_CLASSES.GROUP, DUOTONE_CLASSES.SWAP_OPACITY, DUOTONE_CLASSES.PRIMARY, DUOTONE_CLASSES.SECONDARY]).concat(oneToTen.map(function (n) {
      return "".concat(n, "x");
    })).concat(oneToTwenty.map(function (n) {
      return "w-".concat(n);
    }));

    var initial = WINDOW.FontAwesomeConfig || {};

    function getAttrConfig(attr) {
      var element = DOCUMENT.querySelector('script[' + attr + ']');

      if (element) {
        return element.getAttribute(attr);
      }
    }

    function coerce(val) {
      // Getting an empty string will occur if the attribute is set on the HTML tag but without a value
      // We'll assume that this is an indication that it should be toggled to true
      if (val === '') return true;
      if (val === 'false') return false;
      if (val === 'true') return true;
      return val;
    }

    if (DOCUMENT && typeof DOCUMENT.querySelector === 'function') {
      var attrs = [['data-family-prefix', 'familyPrefix'], ['data-style-default', 'styleDefault'], ['data-replacement-class', 'replacementClass'], ['data-auto-replace-svg', 'autoReplaceSvg'], ['data-auto-add-css', 'autoAddCss'], ['data-auto-a11y', 'autoA11y'], ['data-search-pseudo-elements', 'searchPseudoElements'], ['data-observe-mutations', 'observeMutations'], ['data-mutate-approach', 'mutateApproach'], ['data-keep-original-source', 'keepOriginalSource'], ['data-measure-performance', 'measurePerformance'], ['data-show-missing-icons', 'showMissingIcons']];
      attrs.forEach(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            attr = _ref2[0],
            key = _ref2[1];

        var val = coerce(getAttrConfig(attr));

        if (val !== undefined && val !== null) {
          initial[key] = val;
        }
      });
    }

    var _default = {
      familyPrefix: DEFAULT_FAMILY_PREFIX,
      styleDefault: 'solid',
      replacementClass: DEFAULT_REPLACEMENT_CLASS,
      autoReplaceSvg: true,
      autoAddCss: true,
      autoA11y: true,
      searchPseudoElements: false,
      observeMutations: true,
      mutateApproach: 'async',
      keepOriginalSource: true,
      measurePerformance: false,
      showMissingIcons: true
    };

    var _config = _objectSpread2(_objectSpread2({}, _default), initial);

    if (!_config.autoReplaceSvg) _config.observeMutations = false;
    var config = {};
    Object.keys(_config).forEach(function (key) {
      Object.defineProperty(config, key, {
        enumerable: true,
        set: function set(val) {
          _config[key] = val;

          _onChangeCb.forEach(function (cb) {
            return cb(config);
          });
        },
        get: function get() {
          return _config[key];
        }
      });
    });
    WINDOW.FontAwesomeConfig = config;
    var _onChangeCb = [];
    function onChange(cb) {
      _onChangeCb.push(cb);

      return function () {
        _onChangeCb.splice(_onChangeCb.indexOf(cb), 1);
      };
    }

    var d = UNITS_IN_GRID;
    var meaninglessTransform = {
      size: 16,
      x: 0,
      y: 0,
      rotate: 0,
      flipX: false,
      flipY: false
    };
    function insertCss(css) {
      if (!css || !IS_DOM) {
        return;
      }

      var style = DOCUMENT.createElement('style');
      style.setAttribute('type', 'text/css');
      style.innerHTML = css;
      var headChildren = DOCUMENT.head.childNodes;
      var beforeChild = null;

      for (var i = headChildren.length - 1; i > -1; i--) {
        var child = headChildren[i];
        var tagName = (child.tagName || '').toUpperCase();

        if (['STYLE', 'LINK'].indexOf(tagName) > -1) {
          beforeChild = child;
        }
      }

      DOCUMENT.head.insertBefore(style, beforeChild);
      return css;
    }
    var idPool = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    function nextUniqueId() {
      var size = 12;
      var id = '';

      while (size-- > 0) {
        id += idPool[Math.random() * 62 | 0];
      }

      return id;
    }
    function toArray(obj) {
      var array = [];

      for (var i = (obj || []).length >>> 0; i--;) {
        array[i] = obj[i];
      }

      return array;
    }
    function classArray(node) {
      if (node.classList) {
        return toArray(node.classList);
      } else {
        return (node.getAttribute('class') || '').split(' ').filter(function (i) {
          return i;
        });
      }
    }
    function htmlEscape(str) {
      return "".concat(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }
    function joinAttributes(attributes) {
      return Object.keys(attributes || {}).reduce(function (acc, attributeName) {
        return acc + "".concat(attributeName, "=\"").concat(htmlEscape(attributes[attributeName]), "\" ");
      }, '').trim();
    }
    function joinStyles(styles) {
      return Object.keys(styles || {}).reduce(function (acc, styleName) {
        return acc + "".concat(styleName, ": ").concat(styles[styleName].trim(), ";");
      }, '');
    }
    function transformIsMeaningful(transform) {
      return transform.size !== meaninglessTransform.size || transform.x !== meaninglessTransform.x || transform.y !== meaninglessTransform.y || transform.rotate !== meaninglessTransform.rotate || transform.flipX || transform.flipY;
    }
    function transformForSvg(_ref) {
      var transform = _ref.transform,
          containerWidth = _ref.containerWidth,
          iconWidth = _ref.iconWidth;
      var outer = {
        transform: "translate(".concat(containerWidth / 2, " 256)")
      };
      var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
      var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
      var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
      var inner = {
        transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
      };
      var path = {
        transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
      };
      return {
        outer: outer,
        inner: inner,
        path: path
      };
    }
    function transformForCss(_ref2) {
      var transform = _ref2.transform,
          _ref2$width = _ref2.width,
          width = _ref2$width === void 0 ? UNITS_IN_GRID : _ref2$width,
          _ref2$height = _ref2.height,
          height = _ref2$height === void 0 ? UNITS_IN_GRID : _ref2$height,
          _ref2$startCentered = _ref2.startCentered,
          startCentered = _ref2$startCentered === void 0 ? false : _ref2$startCentered;
      var val = '';

      if (startCentered && IS_IE) {
        val += "translate(".concat(transform.x / d - width / 2, "em, ").concat(transform.y / d - height / 2, "em) ");
      } else if (startCentered) {
        val += "translate(calc(-50% + ".concat(transform.x / d, "em), calc(-50% + ").concat(transform.y / d, "em)) ");
      } else {
        val += "translate(".concat(transform.x / d, "em, ").concat(transform.y / d, "em) ");
      }

      val += "scale(".concat(transform.size / d * (transform.flipX ? -1 : 1), ", ").concat(transform.size / d * (transform.flipY ? -1 : 1), ") ");
      val += "rotate(".concat(transform.rotate, "deg) ");
      return val;
    }

    var baseStyles = ":root, :host {\n  --fa-font-solid: normal 900 1em/1 \"Font Awesome 6 Solid\";\n  --fa-font-regular: normal 400 1em/1 \"Font Awesome 6 Regular\";\n  --fa-font-light: normal 300 1em/1 \"Font Awesome 6 Light\";\n  --fa-font-thin: normal 100 1em/1 \"Font Awesome 6 Thin\";\n  --fa-font-duotone: normal 900 1em/1 \"Font Awesome 6 Duotone\";\n  --fa-font-brands: normal 400 1em/1 \"Font Awesome 6 Brands\";\n}\n\nsvg:not(:root).svg-inline--fa, svg:not(:host).svg-inline--fa {\n  overflow: visible;\n  box-sizing: content-box;\n}\n\n.svg-inline--fa {\n  display: var(--fa-display, inline-block);\n  height: 1em;\n  overflow: visible;\n  vertical-align: -0.125em;\n}\n.svg-inline--fa.fa-2xs {\n  vertical-align: 0.1em;\n}\n.svg-inline--fa.fa-xs {\n  vertical-align: 0em;\n}\n.svg-inline--fa.fa-sm {\n  vertical-align: -0.0714285705em;\n}\n.svg-inline--fa.fa-lg {\n  vertical-align: -0.2em;\n}\n.svg-inline--fa.fa-xl {\n  vertical-align: -0.25em;\n}\n.svg-inline--fa.fa-2xl {\n  vertical-align: -0.3125em;\n}\n.svg-inline--fa.fa-pull-left {\n  margin-right: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-pull-right {\n  margin-left: var(--fa-pull-margin, 0.3em);\n  width: auto;\n}\n.svg-inline--fa.fa-li {\n  width: var(--fa-li-width, 2em);\n  top: 0.25em;\n}\n.svg-inline--fa.fa-fw {\n  width: var(--fa-fw-width, 1.25em);\n}\n\n.fa-layers svg.svg-inline--fa {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n}\n\n.fa-layers-counter, .fa-layers-text {\n  display: inline-block;\n  position: absolute;\n  text-align: center;\n}\n\n.fa-layers {\n  display: inline-block;\n  height: 1em;\n  position: relative;\n  text-align: center;\n  vertical-align: -0.125em;\n  width: 1em;\n}\n.fa-layers svg.svg-inline--fa {\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-text {\n  left: 50%;\n  top: 50%;\n  -webkit-transform: translate(-50%, -50%);\n          transform: translate(-50%, -50%);\n  -webkit-transform-origin: center center;\n          transform-origin: center center;\n}\n\n.fa-layers-counter {\n  background-color: var(--fa-counter-background-color, #ff253a);\n  border-radius: var(--fa-counter-border-radius, 1em);\n  box-sizing: border-box;\n  color: var(--fa-inverse, #fff);\n  line-height: var(--fa-counter-line-height, 1);\n  max-width: var(--fa-counter-max-width, 5em);\n  min-width: var(--fa-counter-min-width, 1.5em);\n  overflow: hidden;\n  padding: var(--fa-counter-padding, 0.25em 0.5em);\n  right: var(--fa-right, 0);\n  text-overflow: ellipsis;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-counter-scale, 0.25));\n          transform: scale(var(--fa-counter-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-bottom-right {\n  bottom: var(--fa-bottom, 0);\n  right: var(--fa-right, 0);\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom right;\n          transform-origin: bottom right;\n}\n\n.fa-layers-bottom-left {\n  bottom: var(--fa-bottom, 0);\n  left: var(--fa-left, 0);\n  right: auto;\n  top: auto;\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: bottom left;\n          transform-origin: bottom left;\n}\n\n.fa-layers-top-right {\n  top: var(--fa-top, 0);\n  right: var(--fa-right, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top right;\n          transform-origin: top right;\n}\n\n.fa-layers-top-left {\n  left: var(--fa-left, 0);\n  right: auto;\n  top: var(--fa-top, 0);\n  -webkit-transform: scale(var(--fa-layers-scale, 0.25));\n          transform: scale(var(--fa-layers-scale, 0.25));\n  -webkit-transform-origin: top left;\n          transform-origin: top left;\n}\n\n.fa-1x {\n  font-size: 1em;\n}\n\n.fa-2x {\n  font-size: 2em;\n}\n\n.fa-3x {\n  font-size: 3em;\n}\n\n.fa-4x {\n  font-size: 4em;\n}\n\n.fa-5x {\n  font-size: 5em;\n}\n\n.fa-6x {\n  font-size: 6em;\n}\n\n.fa-7x {\n  font-size: 7em;\n}\n\n.fa-8x {\n  font-size: 8em;\n}\n\n.fa-9x {\n  font-size: 9em;\n}\n\n.fa-10x {\n  font-size: 10em;\n}\n\n.fa-2xs {\n  font-size: 0.625em;\n  line-height: 0.1em;\n  vertical-align: 0.225em;\n}\n\n.fa-xs {\n  font-size: 0.75em;\n  line-height: 0.0833333337em;\n  vertical-align: 0.125em;\n}\n\n.fa-sm {\n  font-size: 0.875em;\n  line-height: 0.0714285718em;\n  vertical-align: 0.0535714295em;\n}\n\n.fa-lg {\n  font-size: 1.25em;\n  line-height: 0.05em;\n  vertical-align: -0.075em;\n}\n\n.fa-xl {\n  font-size: 1.5em;\n  line-height: 0.0416666682em;\n  vertical-align: -0.125em;\n}\n\n.fa-2xl {\n  font-size: 2em;\n  line-height: 0.03125em;\n  vertical-align: -0.1875em;\n}\n\n.fa-fw {\n  text-align: center;\n  width: 1.25em;\n}\n\n.fa-ul {\n  list-style-type: none;\n  margin-left: var(--fa-li-margin, 2.5em);\n  padding-left: 0;\n}\n.fa-ul > li {\n  position: relative;\n}\n\n.fa-li {\n  left: calc(var(--fa-li-width, 2em) * -1);\n  position: absolute;\n  text-align: center;\n  width: var(--fa-li-width, 2em);\n  line-height: inherit;\n}\n\n.fa-border {\n  border-color: var(--fa-border-color, #eee);\n  border-radius: var(--fa-border-radius, 0.1em);\n  border-style: var(--fa-border-style, solid);\n  border-width: var(--fa-border-width, 0.08em);\n  padding: var(--fa-border-padding, 0.2em 0.25em 0.15em);\n}\n\n.fa-pull-left {\n  float: left;\n  margin-right: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-pull-right {\n  float: right;\n  margin-left: var(--fa-pull-margin, 0.3em);\n}\n\n.fa-beat {\n  -webkit-animation-name: fa-beat;\n          animation-name: fa-beat;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-bounce {\n  -webkit-animation-name: fa-bounce;\n          animation-name: fa-bounce;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.28, 0.84, 0.42, 1));\n}\n\n.fa-fade {\n  -webkit-animation-name: fa-fade;\n          animation-name: fa-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-beat-fade {\n  -webkit-animation-name: fa-beat-fade;\n          animation-name: fa-beat-fade;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n          animation-timing-function: var(--fa-animation-timing, cubic-bezier(0.4, 0, 0.6, 1));\n}\n\n.fa-flip {\n  -webkit-animation-name: fa-flip;\n          animation-name: fa-flip;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, ease-in-out);\n          animation-timing-function: var(--fa-animation-timing, ease-in-out);\n}\n\n.fa-shake {\n  -webkit-animation-name: fa-shake;\n          animation-name: fa-shake;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-delay: var(--fa-animation-delay, 0);\n          animation-delay: var(--fa-animation-delay, 0);\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 2s);\n          animation-duration: var(--fa-animation-duration, 2s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, linear);\n          animation-timing-function: var(--fa-animation-timing, linear);\n}\n\n.fa-spin-reverse {\n  --fa-animation-direction: reverse;\n}\n\n.fa-pulse,\n.fa-spin-pulse {\n  -webkit-animation-name: fa-spin;\n          animation-name: fa-spin;\n  -webkit-animation-direction: var(--fa-animation-direction, normal);\n          animation-direction: var(--fa-animation-direction, normal);\n  -webkit-animation-duration: var(--fa-animation-duration, 1s);\n          animation-duration: var(--fa-animation-duration, 1s);\n  -webkit-animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n          animation-iteration-count: var(--fa-animation-iteration-count, infinite);\n  -webkit-animation-timing-function: var(--fa-animation-timing, steps(8));\n          animation-timing-function: var(--fa-animation-timing, steps(8));\n}\n\n@media (prefers-reduced-motion: reduce) {\n  .fa-beat,\n.fa-bounce,\n.fa-fade,\n.fa-beat-fade,\n.fa-flip,\n.fa-pulse,\n.fa-shake,\n.fa-spin,\n.fa-spin-pulse {\n    -webkit-animation-delay: -1ms;\n            animation-delay: -1ms;\n    -webkit-animation-duration: 1ms;\n            animation-duration: 1ms;\n    -webkit-animation-iteration-count: 1;\n            animation-iteration-count: 1;\n    transition-delay: 0s;\n    transition-duration: 0s;\n  }\n}\n@-webkit-keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@keyframes fa-beat {\n  0%, 90% {\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  45% {\n    -webkit-transform: scale(var(--fa-beat-scale, 1.25));\n            transform: scale(var(--fa-beat-scale, 1.25));\n  }\n}\n@-webkit-keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@keyframes fa-bounce {\n  0% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  10% {\n    -webkit-transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n            transform: scale(var(--fa-bounce-start-scale-x, 1.1), var(--fa-bounce-start-scale-y, 0.9)) translateY(0);\n  }\n  30% {\n    -webkit-transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n            transform: scale(var(--fa-bounce-jump-scale-x, 0.9), var(--fa-bounce-jump-scale-y, 1.1)) translateY(var(--fa-bounce-height, -0.5em));\n  }\n  50% {\n    -webkit-transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n            transform: scale(var(--fa-bounce-land-scale-x, 1.05), var(--fa-bounce-land-scale-y, 0.95)) translateY(0);\n  }\n  57% {\n    -webkit-transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n            transform: scale(1, 1) translateY(var(--fa-bounce-rebound, -0.125em));\n  }\n  64% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n  100% {\n    -webkit-transform: scale(1, 1) translateY(0);\n            transform: scale(1, 1) translateY(0);\n  }\n}\n@-webkit-keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@keyframes fa-fade {\n  50% {\n    opacity: var(--fa-fade-opacity, 0.4);\n  }\n}\n@-webkit-keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@keyframes fa-beat-fade {\n  0%, 100% {\n    opacity: var(--fa-beat-fade-opacity, 0.4);\n    -webkit-transform: scale(1);\n            transform: scale(1);\n  }\n  50% {\n    opacity: 1;\n    -webkit-transform: scale(var(--fa-beat-fade-scale, 1.125));\n            transform: scale(var(--fa-beat-fade-scale, 1.125));\n  }\n}\n@-webkit-keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@keyframes fa-flip {\n  50% {\n    -webkit-transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n            transform: rotate3d(var(--fa-flip-x, 0), var(--fa-flip-y, 1), var(--fa-flip-z, 0), var(--fa-flip-angle, -180deg));\n  }\n}\n@-webkit-keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@keyframes fa-shake {\n  0% {\n    -webkit-transform: rotate(-15deg);\n            transform: rotate(-15deg);\n  }\n  4% {\n    -webkit-transform: rotate(15deg);\n            transform: rotate(15deg);\n  }\n  8%, 24% {\n    -webkit-transform: rotate(-18deg);\n            transform: rotate(-18deg);\n  }\n  12%, 28% {\n    -webkit-transform: rotate(18deg);\n            transform: rotate(18deg);\n  }\n  16% {\n    -webkit-transform: rotate(-22deg);\n            transform: rotate(-22deg);\n  }\n  20% {\n    -webkit-transform: rotate(22deg);\n            transform: rotate(22deg);\n  }\n  32% {\n    -webkit-transform: rotate(-12deg);\n            transform: rotate(-12deg);\n  }\n  36% {\n    -webkit-transform: rotate(12deg);\n            transform: rotate(12deg);\n  }\n  40%, 100% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n}\n@-webkit-keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n@keyframes fa-spin {\n  0% {\n    -webkit-transform: rotate(0deg);\n            transform: rotate(0deg);\n  }\n  100% {\n    -webkit-transform: rotate(360deg);\n            transform: rotate(360deg);\n  }\n}\n.fa-rotate-90 {\n  -webkit-transform: rotate(90deg);\n          transform: rotate(90deg);\n}\n\n.fa-rotate-180 {\n  -webkit-transform: rotate(180deg);\n          transform: rotate(180deg);\n}\n\n.fa-rotate-270 {\n  -webkit-transform: rotate(270deg);\n          transform: rotate(270deg);\n}\n\n.fa-flip-horizontal {\n  -webkit-transform: scale(-1, 1);\n          transform: scale(-1, 1);\n}\n\n.fa-flip-vertical {\n  -webkit-transform: scale(1, -1);\n          transform: scale(1, -1);\n}\n\n.fa-flip-both,\n.fa-flip-horizontal.fa-flip-vertical {\n  -webkit-transform: scale(-1, -1);\n          transform: scale(-1, -1);\n}\n\n.fa-rotate-by {\n  -webkit-transform: rotate(var(--fa-rotate-angle, none));\n          transform: rotate(var(--fa-rotate-angle, none));\n}\n\n.fa-stack {\n  display: inline-block;\n  vertical-align: middle;\n  height: 2em;\n  position: relative;\n  width: 2.5em;\n}\n\n.fa-stack-1x,\n.fa-stack-2x {\n  bottom: 0;\n  left: 0;\n  margin: auto;\n  position: absolute;\n  right: 0;\n  top: 0;\n  z-index: var(--fa-stack-z-index, auto);\n}\n\n.svg-inline--fa.fa-stack-1x {\n  height: 1em;\n  width: 1.25em;\n}\n.svg-inline--fa.fa-stack-2x {\n  height: 2em;\n  width: 2.5em;\n}\n\n.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}\n\n.sr-only,\n.fa-sr-only {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.sr-only-focusable:not(:focus),\n.fa-sr-only-focusable:not(:focus) {\n  position: absolute;\n  width: 1px;\n  height: 1px;\n  padding: 0;\n  margin: -1px;\n  overflow: hidden;\n  clip: rect(0, 0, 0, 0);\n  white-space: nowrap;\n  border-width: 0;\n}\n\n.svg-inline--fa .fa-primary {\n  fill: var(--fa-primary-color, currentColor);\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa .fa-secondary {\n  fill: var(--fa-secondary-color, currentColor);\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-primary {\n  opacity: var(--fa-secondary-opacity, 0.4);\n}\n\n.svg-inline--fa.fa-swap-opacity .fa-secondary {\n  opacity: var(--fa-primary-opacity, 1);\n}\n\n.svg-inline--fa mask .fa-primary,\n.svg-inline--fa mask .fa-secondary {\n  fill: black;\n}\n\n.fad.fa-inverse,\n.fa-duotone.fa-inverse {\n  color: var(--fa-inverse, #fff);\n}";

    function css() {
      var dfp = DEFAULT_FAMILY_PREFIX;
      var drc = DEFAULT_REPLACEMENT_CLASS;
      var fp = config.familyPrefix;
      var rc = config.replacementClass;
      var s = baseStyles;

      if (fp !== dfp || rc !== drc) {
        var dPatt = new RegExp("\\.".concat(dfp, "\\-"), 'g');
        var customPropPatt = new RegExp("\\--".concat(dfp, "\\-"), 'g');
        var rPatt = new RegExp("\\.".concat(drc), 'g');
        s = s.replace(dPatt, ".".concat(fp, "-")).replace(customPropPatt, "--".concat(fp, "-")).replace(rPatt, ".".concat(rc));
      }

      return s;
    }

    var _cssInserted = false;

    function ensureCss() {
      if (config.autoAddCss && !_cssInserted) {
        insertCss(css());
        _cssInserted = true;
      }
    }

    var InjectCSS = {
      mixout: function mixout() {
        return {
          dom: {
            css: css,
            insertCss: ensureCss
          }
        };
      },
      hooks: function hooks() {
        return {
          beforeDOMElementCreation: function beforeDOMElementCreation() {
            ensureCss();
          },
          beforeI2svg: function beforeI2svg() {
            ensureCss();
          }
        };
      }
    };

    var w = WINDOW || {};
    if (!w[NAMESPACE_IDENTIFIER]) w[NAMESPACE_IDENTIFIER] = {};
    if (!w[NAMESPACE_IDENTIFIER].styles) w[NAMESPACE_IDENTIFIER].styles = {};
    if (!w[NAMESPACE_IDENTIFIER].hooks) w[NAMESPACE_IDENTIFIER].hooks = {};
    if (!w[NAMESPACE_IDENTIFIER].shims) w[NAMESPACE_IDENTIFIER].shims = [];
    var namespace = w[NAMESPACE_IDENTIFIER];

    var functions = [];

    var listener = function listener() {
      DOCUMENT.removeEventListener('DOMContentLoaded', listener);
      loaded = 1;
      functions.map(function (fn) {
        return fn();
      });
    };

    var loaded = false;

    if (IS_DOM) {
      loaded = (DOCUMENT.documentElement.doScroll ? /^loaded|^c/ : /^loaded|^i|^c/).test(DOCUMENT.readyState);
      if (!loaded) DOCUMENT.addEventListener('DOMContentLoaded', listener);
    }

    function domready (fn) {
      if (!IS_DOM) return;
      loaded ? setTimeout(fn, 0) : functions.push(fn);
    }

    function toHtml(abstractNodes) {
      var tag = abstractNodes.tag,
          _abstractNodes$attrib = abstractNodes.attributes,
          attributes = _abstractNodes$attrib === void 0 ? {} : _abstractNodes$attrib,
          _abstractNodes$childr = abstractNodes.children,
          children = _abstractNodes$childr === void 0 ? [] : _abstractNodes$childr;

      if (typeof abstractNodes === 'string') {
        return htmlEscape(abstractNodes);
      } else {
        return "<".concat(tag, " ").concat(joinAttributes(attributes), ">").concat(children.map(toHtml).join(''), "</").concat(tag, ">");
      }
    }

    function iconFromMapping(mapping, prefix, iconName) {
      if (mapping && mapping[prefix] && mapping[prefix][iconName]) {
        return {
          prefix: prefix,
          iconName: iconName,
          icon: mapping[prefix][iconName]
        };
      }
    }

    /**
     * Internal helper to bind a function known to have 4 arguments
     * to a given context.
     */

    var bindInternal4 = function bindInternal4(func, thisContext) {
      return function (a, b, c, d) {
        return func.call(thisContext, a, b, c, d);
      };
    };

    /**
     * # Reduce
     *
     * A fast object `.reduce()` implementation.
     *
     * @param  {Object}   subject      The object to reduce over.
     * @param  {Function} fn           The reducer function.
     * @param  {mixed}    initialValue The initial value for the reducer, defaults to subject[0].
     * @param  {Object}   thisContext  The context for the reducer.
     * @return {mixed}                 The final result.
     */


    var reduce = function fastReduceObject(subject, fn, initialValue, thisContext) {
      var keys = Object.keys(subject),
          length = keys.length,
          iterator = thisContext !== undefined ? bindInternal4(fn, thisContext) : fn,
          i,
          key,
          result;

      if (initialValue === undefined) {
        i = 1;
        result = subject[keys[0]];
      } else {
        i = 0;
        result = initialValue;
      }

      for (; i < length; i++) {
        key = keys[i];
        result = iterator(result, subject[key], key, subject);
      }

      return result;
    };

    /**
     * ucs2decode() and codePointAt() are both works of Mathias Bynens and licensed under MIT
     *
     * Copyright Mathias Bynens <https://mathiasbynens.be/>

     * Permission is hereby granted, free of charge, to any person obtaining
     * a copy of this software and associated documentation files (the
     * "Software"), to deal in the Software without restriction, including
     * without limitation the rights to use, copy, modify, merge, publish,
     * distribute, sublicense, and/or sell copies of the Software, and to
     * permit persons to whom the Software is furnished to do so, subject to
     * the following conditions:

     * The above copyright notice and this permission notice shall be
     * included in all copies or substantial portions of the Software.

     * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
     * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
     * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
     * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
     * LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
     * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
     * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
     */
    function ucs2decode(string) {
      var output = [];
      var counter = 0;
      var length = string.length;

      while (counter < length) {
        var value = string.charCodeAt(counter++);

        if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
          var extra = string.charCodeAt(counter++);

          if ((extra & 0xFC00) == 0xDC00) {
            // eslint-disable-line eqeqeq
            output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
          } else {
            output.push(value);
            counter--;
          }
        } else {
          output.push(value);
        }
      }

      return output;
    }

    function toHex(unicode) {
      var decoded = ucs2decode(unicode);
      return decoded.length === 1 ? decoded[0].toString(16) : null;
    }
    function codePointAt(string, index) {
      var size = string.length;
      var first = string.charCodeAt(index);
      var second;

      if (first >= 0xD800 && first <= 0xDBFF && size > index + 1) {
        second = string.charCodeAt(index + 1);

        if (second >= 0xDC00 && second <= 0xDFFF) {
          return (first - 0xD800) * 0x400 + second - 0xDC00 + 0x10000;
        }
      }

      return first;
    }

    function normalizeIcons(icons) {
      return Object.keys(icons).reduce(function (acc, iconName) {
        var icon = icons[iconName];
        var expanded = !!icon.icon;

        if (expanded) {
          acc[icon.iconName] = icon.icon;
        } else {
          acc[iconName] = icon;
        }

        return acc;
      }, {});
    }

    function defineIcons(prefix, icons) {
      var params = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
      var _params$skipHooks = params.skipHooks,
          skipHooks = _params$skipHooks === void 0 ? false : _params$skipHooks;
      var normalized = normalizeIcons(icons);

      if (typeof namespace.hooks.addPack === 'function' && !skipHooks) {
        namespace.hooks.addPack(prefix, normalizeIcons(icons));
      } else {
        namespace.styles[prefix] = _objectSpread2(_objectSpread2({}, namespace.styles[prefix] || {}), normalized);
      }
      /**
       * Font Awesome 4 used the prefix of `fa` for all icons. With the introduction
       * of new styles we needed to differentiate between them. Prefix `fa` is now an alias
       * for `fas` so we'll ease the upgrade process for our users by automatically defining
       * this as well.
       */


      if (prefix === 'fas') {
        defineIcons('fa', icons);
      }
    }

    var styles = namespace.styles,
        shims = namespace.shims;
    var LONG_STYLE = Object.values(PREFIX_TO_LONG_STYLE);
    var _defaultUsablePrefix = null;
    var _byUnicode = {};
    var _byLigature = {};
    var _byOldName = {};
    var _byOldUnicode = {};
    var _byAlias = {};
    var PREFIXES = Object.keys(PREFIX_TO_STYLE);

    function isReserved(name) {
      return ~RESERVED_CLASSES.indexOf(name);
    }

    function getIconName(familyPrefix, cls) {
      var parts = cls.split('-');
      var prefix = parts[0];
      var iconName = parts.slice(1).join('-');

      if (prefix === familyPrefix && iconName !== '' && !isReserved(iconName)) {
        return iconName;
      } else {
        return null;
      }
    }
    var build = function build() {
      var lookup = function lookup(reducer) {
        return reduce(styles, function (o, style, prefix) {
          o[prefix] = reduce(style, reducer, {});
          return o;
        }, {});
      };

      _byUnicode = lookup(function (acc, icon, iconName) {
        if (icon[3]) {
          acc[icon[3]] = iconName;
        }

        if (icon[2]) {
          var aliases = icon[2].filter(function (a) {
            return typeof a === 'number';
          });
          aliases.forEach(function (alias) {
            acc[alias.toString(16)] = iconName;
          });
        }

        return acc;
      });
      _byLigature = lookup(function (acc, icon, iconName) {
        acc[iconName] = iconName;

        if (icon[2]) {
          var aliases = icon[2].filter(function (a) {
            return typeof a === 'string';
          });
          aliases.forEach(function (alias) {
            acc[alias] = iconName;
          });
        }

        return acc;
      });
      _byAlias = lookup(function (acc, icon, iconName) {
        var aliases = icon[2];
        acc[iconName] = iconName;
        aliases.forEach(function (alias) {
          acc[alias] = iconName;
        });
        return acc;
      }); // If we have a Kit, we can't determine if regular is available since we
      // could be auto-fetching it. We'll have to assume that it is available.

      var hasRegular = 'far' in styles || config.autoFetchSvg;
      var shimLookups = reduce(shims, function (acc, shim) {
        var maybeNameMaybeUnicode = shim[0];
        var prefix = shim[1];
        var iconName = shim[2];

        if (prefix === 'far' && !hasRegular) {
          prefix = 'fas';
        }

        if (typeof maybeNameMaybeUnicode === 'string') {
          acc.names[maybeNameMaybeUnicode] = {
            prefix: prefix,
            iconName: iconName
          };
        }

        if (typeof maybeNameMaybeUnicode === 'number') {
          acc.unicodes[maybeNameMaybeUnicode.toString(16)] = {
            prefix: prefix,
            iconName: iconName
          };
        }

        return acc;
      }, {
        names: {},
        unicodes: {}
      });
      _byOldName = shimLookups.names;
      _byOldUnicode = shimLookups.unicodes;
      _defaultUsablePrefix = getCanonicalPrefix(config.styleDefault);
    };
    onChange(function (c) {
      _defaultUsablePrefix = getCanonicalPrefix(c.styleDefault);
    });
    build();
    function byUnicode(prefix, unicode) {
      return (_byUnicode[prefix] || {})[unicode];
    }
    function byLigature(prefix, ligature) {
      return (_byLigature[prefix] || {})[ligature];
    }
    function byAlias(prefix, alias) {
      return (_byAlias[prefix] || {})[alias];
    }
    function byOldName(name) {
      return _byOldName[name] || {
        prefix: null,
        iconName: null
      };
    }
    function byOldUnicode(unicode) {
      var oldUnicode = _byOldUnicode[unicode];
      var newUnicode = byUnicode('fas', unicode);
      return oldUnicode || (newUnicode ? {
        prefix: 'fas',
        iconName: newUnicode
      } : null) || {
        prefix: null,
        iconName: null
      };
    }
    function getDefaultUsablePrefix() {
      return _defaultUsablePrefix;
    }
    var emptyCanonicalIcon = function emptyCanonicalIcon() {
      return {
        prefix: null,
        iconName: null,
        rest: []
      };
    };
    function getCanonicalPrefix(styleOrPrefix) {
      var style = PREFIX_TO_STYLE[styleOrPrefix];
      var prefix = STYLE_TO_PREFIX[styleOrPrefix] || STYLE_TO_PREFIX[style];
      var defined = styleOrPrefix in namespace.styles ? styleOrPrefix : null;
      return prefix || defined || null;
    }
    function getCanonicalIcon(values) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$skipLookups = params.skipLookups,
          skipLookups = _params$skipLookups === void 0 ? false : _params$skipLookups;
      var givenPrefix = null;
      var canonical = values.reduce(function (acc, cls) {
        var iconName = getIconName(config.familyPrefix, cls);

        if (styles[cls]) {
          cls = LONG_STYLE.includes(cls) ? LONG_STYLE_TO_PREFIX[cls] : cls;
          givenPrefix = cls;
          acc.prefix = cls;
        } else if (PREFIXES.indexOf(cls) > -1) {
          givenPrefix = cls;
          acc.prefix = getCanonicalPrefix(cls);
        } else if (iconName) {
          acc.iconName = iconName;
        } else if (cls !== config.replacementClass) {
          acc.rest.push(cls);
        }

        if (!skipLookups && acc.prefix && acc.iconName) {
          var shim = givenPrefix === 'fa' ? byOldName(acc.iconName) : {};
          var aliasIconName = byAlias(acc.prefix, acc.iconName);

          if (shim.prefix) {
            givenPrefix = null;
          }

          acc.iconName = shim.iconName || aliasIconName || acc.iconName;
          acc.prefix = shim.prefix || acc.prefix;

          if (acc.prefix === 'far' && !styles['far'] && styles['fas'] && !config.autoFetchSvg) {
            // Allow a fallback from the regular style to solid if regular is not available
            // but only if we aren't auto-fetching SVGs
            acc.prefix = 'fas';
          }
        }

        return acc;
      }, emptyCanonicalIcon());

      if (canonical.prefix === 'fa' || givenPrefix === 'fa') {
        // The fa prefix is not canonical. So if it has made it through until this point
        // we will shift it to the correct prefix.
        canonical.prefix = getDefaultUsablePrefix() || 'fas';
      }

      return canonical;
    }

    var Library = /*#__PURE__*/function () {
      function Library() {
        _classCallCheck(this, Library);

        this.definitions = {};
      }

      _createClass(Library, [{
        key: "add",
        value: function add() {
          var _this = this;

          for (var _len = arguments.length, definitions = new Array(_len), _key = 0; _key < _len; _key++) {
            definitions[_key] = arguments[_key];
          }

          var additions = definitions.reduce(this._pullDefinitions, {});
          Object.keys(additions).forEach(function (key) {
            _this.definitions[key] = _objectSpread2(_objectSpread2({}, _this.definitions[key] || {}), additions[key]);
            defineIcons(key, additions[key]);
            var longPrefix = PREFIX_TO_LONG_STYLE[key];
            if (longPrefix) defineIcons(longPrefix, additions[key]);
            build();
          });
        }
      }, {
        key: "reset",
        value: function reset() {
          this.definitions = {};
        }
      }, {
        key: "_pullDefinitions",
        value: function _pullDefinitions(additions, definition) {
          var normalized = definition.prefix && definition.iconName && definition.icon ? {
            0: definition
          } : definition;
          Object.keys(normalized).map(function (key) {
            var _normalized$key = normalized[key],
                prefix = _normalized$key.prefix,
                iconName = _normalized$key.iconName,
                icon = _normalized$key.icon;
            var aliases = icon[2];
            if (!additions[prefix]) additions[prefix] = {};

            if (aliases.length > 0) {
              aliases.forEach(function (alias) {
                if (typeof alias === 'string') {
                  additions[prefix][alias] = icon;
                }
              });
            }

            additions[prefix][iconName] = icon;
          });
          return additions;
        }
      }]);

      return Library;
    }();

    var _plugins = [];
    var _hooks = {};
    var providers = {};
    var defaultProviderKeys = Object.keys(providers);
    function registerPlugins(nextPlugins, _ref) {
      var obj = _ref.mixoutsTo;
      _plugins = nextPlugins;
      _hooks = {};
      Object.keys(providers).forEach(function (k) {
        if (defaultProviderKeys.indexOf(k) === -1) {
          delete providers[k];
        }
      });

      _plugins.forEach(function (plugin) {
        var mixout = plugin.mixout ? plugin.mixout() : {};
        Object.keys(mixout).forEach(function (tk) {
          if (typeof mixout[tk] === 'function') {
            obj[tk] = mixout[tk];
          }

          if (_typeof(mixout[tk]) === 'object') {
            Object.keys(mixout[tk]).forEach(function (sk) {
              if (!obj[tk]) {
                obj[tk] = {};
              }

              obj[tk][sk] = mixout[tk][sk];
            });
          }
        });

        if (plugin.hooks) {
          var hooks = plugin.hooks();
          Object.keys(hooks).forEach(function (hook) {
            if (!_hooks[hook]) {
              _hooks[hook] = [];
            }

            _hooks[hook].push(hooks[hook]);
          });
        }

        if (plugin.provides) {
          plugin.provides(providers);
        }
      });

      return obj;
    }
    function chainHooks(hook, accumulator) {
      for (var _len = arguments.length, args = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var hookFns = _hooks[hook] || [];
      hookFns.forEach(function (hookFn) {
        accumulator = hookFn.apply(null, [accumulator].concat(args)); // eslint-disable-line no-useless-call
      });
      return accumulator;
    }
    function callHooks(hook) {
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }

      var hookFns = _hooks[hook] || [];
      hookFns.forEach(function (hookFn) {
        hookFn.apply(null, args);
      });
      return undefined;
    }
    function callProvided() {
      var hook = arguments[0];
      var args = Array.prototype.slice.call(arguments, 1);
      return providers[hook] ? providers[hook].apply(null, args) : undefined;
    }

    function findIconDefinition(iconLookup) {
      if (iconLookup.prefix === 'fa') {
        iconLookup.prefix = 'fas';
      }

      var iconName = iconLookup.iconName;
      var prefix = iconLookup.prefix || getDefaultUsablePrefix();
      if (!iconName) return;
      iconName = byAlias(prefix, iconName) || iconName;
      return iconFromMapping(library.definitions, prefix, iconName) || iconFromMapping(namespace.styles, prefix, iconName);
    }
    var library = new Library();
    var noAuto = function noAuto() {
      config.autoReplaceSvg = false;
      config.observeMutations = false;
      callHooks('noAuto');
    };
    var dom = {
      i2svg: function i2svg() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

        if (IS_DOM) {
          callHooks('beforeI2svg', params);
          callProvided('pseudoElements2svg', params);
          return callProvided('i2svg', params);
        } else {
          return Promise.reject('Operation requires a DOM of some kind.');
        }
      },
      watch: function watch() {
        var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        var autoReplaceSvgRoot = params.autoReplaceSvgRoot;

        if (config.autoReplaceSvg === false) {
          config.autoReplaceSvg = true;
        }

        config.observeMutations = true;
        domready(function () {
          autoReplace({
            autoReplaceSvgRoot: autoReplaceSvgRoot
          });
          callHooks('watch', params);
        });
      }
    };
    var parse = {
      icon: function icon(_icon) {
        if (_icon === null) {
          return null;
        }

        if (_typeof(_icon) === 'object' && _icon.prefix && _icon.iconName) {
          return {
            prefix: _icon.prefix,
            iconName: byAlias(_icon.prefix, _icon.iconName) || _icon.iconName
          };
        }

        if (Array.isArray(_icon) && _icon.length === 2) {
          var iconName = _icon[1].indexOf('fa-') === 0 ? _icon[1].slice(3) : _icon[1];
          var prefix = getCanonicalPrefix(_icon[0]);
          return {
            prefix: prefix,
            iconName: byAlias(prefix, iconName) || iconName
          };
        }

        if (typeof _icon === 'string' && (_icon.indexOf("".concat(config.familyPrefix, "-")) > -1 || _icon.match(ICON_SELECTION_SYNTAX_PATTERN))) {
          var canonicalIcon = getCanonicalIcon(_icon.split(' '), {
            skipLookups: true
          });
          return {
            prefix: canonicalIcon.prefix || getDefaultUsablePrefix(),
            iconName: byAlias(canonicalIcon.prefix, canonicalIcon.iconName) || canonicalIcon.iconName
          };
        }

        if (typeof _icon === 'string') {
          var _prefix = getDefaultUsablePrefix();

          return {
            prefix: _prefix,
            iconName: byAlias(_prefix, _icon) || _icon
          };
        }
      }
    };
    var api = {
      noAuto: noAuto,
      config: config,
      dom: dom,
      parse: parse,
      library: library,
      findIconDefinition: findIconDefinition,
      toHtml: toHtml
    };

    var autoReplace = function autoReplace() {
      var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      var _params$autoReplaceSv = params.autoReplaceSvgRoot,
          autoReplaceSvgRoot = _params$autoReplaceSv === void 0 ? DOCUMENT : _params$autoReplaceSv;
      if ((Object.keys(namespace.styles).length > 0 || config.autoFetchSvg) && IS_DOM && config.autoReplaceSvg) api.dom.i2svg({
        node: autoReplaceSvgRoot
      });
    };

    function domVariants(val, abstractCreator) {
      Object.defineProperty(val, 'abstract', {
        get: abstractCreator
      });
      Object.defineProperty(val, 'html', {
        get: function get() {
          return val.abstract.map(function (a) {
            return toHtml(a);
          });
        }
      });
      Object.defineProperty(val, 'node', {
        get: function get() {
          if (!IS_DOM) return;
          var container = DOCUMENT.createElement('div');
          container.innerHTML = val.html;
          return container.children;
        }
      });
      return val;
    }

    function asIcon (_ref) {
      var children = _ref.children,
          main = _ref.main,
          mask = _ref.mask,
          attributes = _ref.attributes,
          styles = _ref.styles,
          transform = _ref.transform;

      if (transformIsMeaningful(transform) && main.found && !mask.found) {
        var width = main.width,
            height = main.height;
        var offset = {
          x: width / height / 2,
          y: 0.5
        };
        attributes['style'] = joinStyles(_objectSpread2(_objectSpread2({}, styles), {}, {
          'transform-origin': "".concat(offset.x + transform.x / 16, "em ").concat(offset.y + transform.y / 16, "em")
        }));
      }

      return [{
        tag: 'svg',
        attributes: attributes,
        children: children
      }];
    }

    function asSymbol (_ref) {
      var prefix = _ref.prefix,
          iconName = _ref.iconName,
          children = _ref.children,
          attributes = _ref.attributes,
          symbol = _ref.symbol;
      var id = symbol === true ? "".concat(prefix, "-").concat(config.familyPrefix, "-").concat(iconName) : symbol;
      return [{
        tag: 'svg',
        attributes: {
          style: 'display: none;'
        },
        children: [{
          tag: 'symbol',
          attributes: _objectSpread2(_objectSpread2({}, attributes), {}, {
            id: id
          }),
          children: children
        }]
      }];
    }

    function makeInlineSvgAbstract(params) {
      var _params$icons = params.icons,
          main = _params$icons.main,
          mask = _params$icons.mask,
          prefix = params.prefix,
          iconName = params.iconName,
          transform = params.transform,
          symbol = params.symbol,
          title = params.title,
          maskId = params.maskId,
          titleId = params.titleId,
          extra = params.extra,
          _params$watchable = params.watchable,
          watchable = _params$watchable === void 0 ? false : _params$watchable;

      var _ref = mask.found ? mask : main,
          width = _ref.width,
          height = _ref.height;

      var isUploadedIcon = prefix === 'fak';
      var attrClass = [config.replacementClass, iconName ? "".concat(config.familyPrefix, "-").concat(iconName) : ''].filter(function (c) {
        return extra.classes.indexOf(c) === -1;
      }).filter(function (c) {
        return c !== '' || !!c;
      }).concat(extra.classes).join(' ');
      var content = {
        children: [],
        attributes: _objectSpread2(_objectSpread2({}, extra.attributes), {}, {
          'data-prefix': prefix,
          'data-icon': iconName,
          'class': attrClass,
          'role': extra.attributes.role || 'img',
          'xmlns': 'http://www.w3.org/2000/svg',
          'viewBox': "0 0 ".concat(width, " ").concat(height)
        })
      };
      var uploadedIconWidthStyle = isUploadedIcon && !~extra.classes.indexOf('fa-fw') ? {
        width: "".concat(width / height * 16 * 0.0625, "em")
      } : {};

      if (watchable) {
        content.attributes[DATA_FA_I2SVG] = '';
      }

      if (title) {
        content.children.push({
          tag: 'title',
          attributes: {
            id: content.attributes['aria-labelledby'] || "title-".concat(titleId || nextUniqueId())
          },
          children: [title]
        });
        delete content.attributes.title;
      }

      var args = _objectSpread2(_objectSpread2({}, content), {}, {
        prefix: prefix,
        iconName: iconName,
        main: main,
        mask: mask,
        maskId: maskId,
        transform: transform,
        symbol: symbol,
        styles: _objectSpread2(_objectSpread2({}, uploadedIconWidthStyle), extra.styles)
      });

      var _ref2 = mask.found && main.found ? callProvided('generateAbstractMask', args) || {
        children: [],
        attributes: {}
      } : callProvided('generateAbstractIcon', args) || {
        children: [],
        attributes: {}
      },
          children = _ref2.children,
          attributes = _ref2.attributes;

      args.children = children;
      args.attributes = attributes;

      if (symbol) {
        return asSymbol(args);
      } else {
        return asIcon(args);
      }
    }
    function makeLayersTextAbstract(params) {
      var content = params.content,
          width = params.width,
          height = params.height,
          transform = params.transform,
          title = params.title,
          extra = params.extra,
          _params$watchable2 = params.watchable,
          watchable = _params$watchable2 === void 0 ? false : _params$watchable2;

      var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
        'title': title
      } : {}), {}, {
        'class': extra.classes.join(' ')
      });

      if (watchable) {
        attributes[DATA_FA_I2SVG] = '';
      }

      var styles = _objectSpread2({}, extra.styles);

      if (transformIsMeaningful(transform)) {
        styles['transform'] = transformForCss({
          transform: transform,
          startCentered: true,
          width: width,
          height: height
        });
        styles['-webkit-transform'] = styles['transform'];
      }

      var styleString = joinStyles(styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }
    function makeLayersCounterAbstract(params) {
      var content = params.content,
          title = params.title,
          extra = params.extra;

      var attributes = _objectSpread2(_objectSpread2(_objectSpread2({}, extra.attributes), title ? {
        'title': title
      } : {}), {}, {
        'class': extra.classes.join(' ')
      });

      var styleString = joinStyles(extra.styles);

      if (styleString.length > 0) {
        attributes['style'] = styleString;
      }

      var val = [];
      val.push({
        tag: 'span',
        attributes: attributes,
        children: [content]
      });

      if (title) {
        val.push({
          tag: 'span',
          attributes: {
            class: 'sr-only'
          },
          children: [title]
        });
      }

      return val;
    }

    var styles$1 = namespace.styles;
    function asFoundIcon(icon) {
      var width = icon[0];
      var height = icon[1];

      var _icon$slice = icon.slice(4),
          _icon$slice2 = _slicedToArray(_icon$slice, 1),
          vectorData = _icon$slice2[0];

      var element = null;

      if (Array.isArray(vectorData)) {
        element = {
          tag: 'g',
          attributes: {
            class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.GROUP)
          },
          children: [{
            tag: 'path',
            attributes: {
              class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.SECONDARY),
              fill: 'currentColor',
              d: vectorData[0]
            }
          }, {
            tag: 'path',
            attributes: {
              class: "".concat(config.familyPrefix, "-").concat(DUOTONE_CLASSES.PRIMARY),
              fill: 'currentColor',
              d: vectorData[1]
            }
          }]
        };
      } else {
        element = {
          tag: 'path',
          attributes: {
            fill: 'currentColor',
            d: vectorData
          }
        };
      }

      return {
        found: true,
        width: width,
        height: height,
        icon: element
      };
    }
    var missingIconResolutionMixin = {
      found: false,
      width: 512,
      height: 512
    };

    function maybeNotifyMissing(iconName, prefix) {
      if (!PRODUCTION && !config.showMissingIcons && iconName) {
        console.error("Icon with name \"".concat(iconName, "\" and prefix \"").concat(prefix, "\" is missing."));
      }
    }

    function findIcon(iconName, prefix) {
      var givenPrefix = prefix;

      if (prefix === 'fa' && config.styleDefault !== null) {
        prefix = getDefaultUsablePrefix();
      }

      return new Promise(function (resolve, reject) {
        ({
          found: false,
          width: 512,
          height: 512,
          icon: callProvided('missingIconAbstract') || {}
        });

        if (givenPrefix === 'fa') {
          var shim = byOldName(iconName) || {};
          iconName = shim.iconName || iconName;
          prefix = shim.prefix || prefix;
        }

        if (iconName && prefix && styles$1[prefix] && styles$1[prefix][iconName]) {
          var icon = styles$1[prefix][iconName];
          return resolve(asFoundIcon(icon));
        }

        maybeNotifyMissing(iconName, prefix);
        resolve(_objectSpread2(_objectSpread2({}, missingIconResolutionMixin), {}, {
          icon: config.showMissingIcons && iconName ? callProvided('missingIconAbstract') || {} : {}
        }));
      });
    }

    var noop$1 = function noop() {};

    var p = config.measurePerformance && PERFORMANCE && PERFORMANCE.mark && PERFORMANCE.measure ? PERFORMANCE : {
      mark: noop$1,
      measure: noop$1
    };
    var preamble = "FA \"6.1.1\"";

    var begin = function begin(name) {
      p.mark("".concat(preamble, " ").concat(name, " begins"));
      return function () {
        return end(name);
      };
    };

    var end = function end(name) {
      p.mark("".concat(preamble, " ").concat(name, " ends"));
      p.measure("".concat(preamble, " ").concat(name), "".concat(preamble, " ").concat(name, " begins"), "".concat(preamble, " ").concat(name, " ends"));
    };

    var perf = {
      begin: begin,
      end: end
    };

    var noop$2 = function noop() {};

    function isWatched(node) {
      var i2svg = node.getAttribute ? node.getAttribute(DATA_FA_I2SVG) : null;
      return typeof i2svg === 'string';
    }

    function hasPrefixAndIcon(node) {
      var prefix = node.getAttribute ? node.getAttribute(DATA_PREFIX) : null;
      var icon = node.getAttribute ? node.getAttribute(DATA_ICON) : null;
      return prefix && icon;
    }

    function hasBeenReplaced(node) {
      return node && node.classList && node.classList.contains && node.classList.contains(config.replacementClass);
    }

    function getMutator() {
      if (config.autoReplaceSvg === true) {
        return mutators.replace;
      }

      var mutator = mutators[config.autoReplaceSvg];
      return mutator || mutators.replace;
    }

    function createElementNS(tag) {
      return DOCUMENT.createElementNS('http://www.w3.org/2000/svg', tag);
    }

    function createElement(tag) {
      return DOCUMENT.createElement(tag);
    }

    function convertSVG(abstractObj) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$ceFn = params.ceFn,
          ceFn = _params$ceFn === void 0 ? abstractObj.tag === 'svg' ? createElementNS : createElement : _params$ceFn;

      if (typeof abstractObj === 'string') {
        return DOCUMENT.createTextNode(abstractObj);
      }

      var tag = ceFn(abstractObj.tag);
      Object.keys(abstractObj.attributes || []).forEach(function (key) {
        tag.setAttribute(key, abstractObj.attributes[key]);
      });
      var children = abstractObj.children || [];
      children.forEach(function (child) {
        tag.appendChild(convertSVG(child, {
          ceFn: ceFn
        }));
      });
      return tag;
    }

    function nodeAsComment(node) {
      var comment = " ".concat(node.outerHTML, " ");
      /* BEGIN.ATTRIBUTION */

      comment = "".concat(comment, "Font Awesome fontawesome.com ");
      /* END.ATTRIBUTION */

      return comment;
    }

    var mutators = {
      replace: function replace(mutation) {
        var node = mutation[0];

        if (node.parentNode) {
          mutation[1].forEach(function (abstract) {
            node.parentNode.insertBefore(convertSVG(abstract), node);
          });

          if (node.getAttribute(DATA_FA_I2SVG) === null && config.keepOriginalSource) {
            var comment = DOCUMENT.createComment(nodeAsComment(node));
            node.parentNode.replaceChild(comment, node);
          } else {
            node.remove();
          }
        }
      },
      nest: function nest(mutation) {
        var node = mutation[0];
        var abstract = mutation[1]; // If we already have a replaced node we do not want to continue nesting within it.
        // Short-circuit to the standard replacement

        if (~classArray(node).indexOf(config.replacementClass)) {
          return mutators.replace(mutation);
        }

        var forSvg = new RegExp("".concat(config.familyPrefix, "-.*"));
        delete abstract[0].attributes.id;

        if (abstract[0].attributes.class) {
          var splitClasses = abstract[0].attributes.class.split(' ').reduce(function (acc, cls) {
            if (cls === config.replacementClass || cls.match(forSvg)) {
              acc.toSvg.push(cls);
            } else {
              acc.toNode.push(cls);
            }

            return acc;
          }, {
            toNode: [],
            toSvg: []
          });
          abstract[0].attributes.class = splitClasses.toSvg.join(' ');

          if (splitClasses.toNode.length === 0) {
            node.removeAttribute('class');
          } else {
            node.setAttribute('class', splitClasses.toNode.join(' '));
          }
        }

        var newInnerHTML = abstract.map(function (a) {
          return toHtml(a);
        }).join('\n');
        node.setAttribute(DATA_FA_I2SVG, '');
        node.innerHTML = newInnerHTML;
      }
    };

    function performOperationSync(op) {
      op();
    }

    function perform(mutations, callback) {
      var callbackFunction = typeof callback === 'function' ? callback : noop$2;

      if (mutations.length === 0) {
        callbackFunction();
      } else {
        var frame = performOperationSync;

        if (config.mutateApproach === MUTATION_APPROACH_ASYNC) {
          frame = WINDOW.requestAnimationFrame || performOperationSync;
        }

        frame(function () {
          var mutator = getMutator();
          var mark = perf.begin('mutate');
          mutations.map(mutator);
          mark();
          callbackFunction();
        });
      }
    }
    var disabled = false;
    function disableObservation() {
      disabled = true;
    }
    function enableObservation() {
      disabled = false;
    }
    var mo = null;
    function observe(options) {
      if (!MUTATION_OBSERVER) {
        return;
      }

      if (!config.observeMutations) {
        return;
      }

      var _options$treeCallback = options.treeCallback,
          treeCallback = _options$treeCallback === void 0 ? noop$2 : _options$treeCallback,
          _options$nodeCallback = options.nodeCallback,
          nodeCallback = _options$nodeCallback === void 0 ? noop$2 : _options$nodeCallback,
          _options$pseudoElemen = options.pseudoElementsCallback,
          pseudoElementsCallback = _options$pseudoElemen === void 0 ? noop$2 : _options$pseudoElemen,
          _options$observeMutat = options.observeMutationsRoot,
          observeMutationsRoot = _options$observeMutat === void 0 ? DOCUMENT : _options$observeMutat;
      mo = new MUTATION_OBSERVER(function (objects) {
        if (disabled) return;
        var defaultPrefix = getDefaultUsablePrefix();
        toArray(objects).forEach(function (mutationRecord) {
          if (mutationRecord.type === 'childList' && mutationRecord.addedNodes.length > 0 && !isWatched(mutationRecord.addedNodes[0])) {
            if (config.searchPseudoElements) {
              pseudoElementsCallback(mutationRecord.target);
            }

            treeCallback(mutationRecord.target);
          }

          if (mutationRecord.type === 'attributes' && mutationRecord.target.parentNode && config.searchPseudoElements) {
            pseudoElementsCallback(mutationRecord.target.parentNode);
          }

          if (mutationRecord.type === 'attributes' && isWatched(mutationRecord.target) && ~ATTRIBUTES_WATCHED_FOR_MUTATION.indexOf(mutationRecord.attributeName)) {
            if (mutationRecord.attributeName === 'class' && hasPrefixAndIcon(mutationRecord.target)) {
              var _getCanonicalIcon = getCanonicalIcon(classArray(mutationRecord.target)),
                  prefix = _getCanonicalIcon.prefix,
                  iconName = _getCanonicalIcon.iconName;

              mutationRecord.target.setAttribute(DATA_PREFIX, prefix || defaultPrefix);
              if (iconName) mutationRecord.target.setAttribute(DATA_ICON, iconName);
            } else if (hasBeenReplaced(mutationRecord.target)) {
              nodeCallback(mutationRecord.target);
            }
          }
        });
      });
      if (!IS_DOM) return;
      mo.observe(observeMutationsRoot, {
        childList: true,
        attributes: true,
        characterData: true,
        subtree: true
      });
    }
    function disconnect() {
      if (!mo) return;
      mo.disconnect();
    }

    function styleParser (node) {
      var style = node.getAttribute('style');
      var val = [];

      if (style) {
        val = style.split(';').reduce(function (acc, style) {
          var styles = style.split(':');
          var prop = styles[0];
          var value = styles.slice(1);

          if (prop && value.length > 0) {
            acc[prop] = value.join(':').trim();
          }

          return acc;
        }, {});
      }

      return val;
    }

    function classParser (node) {
      var existingPrefix = node.getAttribute('data-prefix');
      var existingIconName = node.getAttribute('data-icon');
      var innerText = node.innerText !== undefined ? node.innerText.trim() : '';
      var val = getCanonicalIcon(classArray(node));

      if (!val.prefix) {
        val.prefix = getDefaultUsablePrefix();
      }

      if (existingPrefix && existingIconName) {
        val.prefix = existingPrefix;
        val.iconName = existingIconName;
      }

      if (val.iconName && val.prefix) {
        return val;
      }

      if (val.prefix && innerText.length > 0) {
        val.iconName = byLigature(val.prefix, node.innerText) || byUnicode(val.prefix, toHex(node.innerText));
      }

      return val;
    }

    function attributesParser (node) {
      var extraAttributes = toArray(node.attributes).reduce(function (acc, attr) {
        if (acc.name !== 'class' && acc.name !== 'style') {
          acc[attr.name] = attr.value;
        }

        return acc;
      }, {});
      var title = node.getAttribute('title');
      var titleId = node.getAttribute('data-fa-title-id');

      if (config.autoA11y) {
        if (title) {
          extraAttributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
        } else {
          extraAttributes['aria-hidden'] = 'true';
          extraAttributes['focusable'] = 'false';
        }
      }

      return extraAttributes;
    }

    function blankMeta() {
      return {
        iconName: null,
        title: null,
        titleId: null,
        prefix: null,
        transform: meaninglessTransform,
        symbol: false,
        mask: {
          iconName: null,
          prefix: null,
          rest: []
        },
        maskId: null,
        extra: {
          classes: [],
          styles: {},
          attributes: {}
        }
      };
    }
    function parseMeta(node) {
      var parser = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {
        styleParser: true
      };

      var _classParser = classParser(node),
          iconName = _classParser.iconName,
          prefix = _classParser.prefix,
          extraClasses = _classParser.rest;

      var extraAttributes = attributesParser(node);
      var pluginMeta = chainHooks('parseNodeAttributes', {}, node);
      var extraStyles = parser.styleParser ? styleParser(node) : [];
      return _objectSpread2({
        iconName: iconName,
        title: node.getAttribute('title'),
        titleId: node.getAttribute('data-fa-title-id'),
        prefix: prefix,
        transform: meaninglessTransform,
        mask: {
          iconName: null,
          prefix: null,
          rest: []
        },
        maskId: null,
        symbol: false,
        extra: {
          classes: extraClasses,
          styles: extraStyles,
          attributes: extraAttributes
        }
      }, pluginMeta);
    }

    var styles$2 = namespace.styles;

    function generateMutation(node) {
      var nodeMeta = config.autoReplaceSvg === 'nest' ? parseMeta(node, {
        styleParser: false
      }) : parseMeta(node);

      if (~nodeMeta.extra.classes.indexOf(LAYERS_TEXT_CLASSNAME)) {
        return callProvided('generateLayersText', node, nodeMeta);
      } else {
        return callProvided('generateSvgReplacementMutation', node, nodeMeta);
      }
    }

    function onTree(root) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      if (!IS_DOM) return Promise.resolve();
      var htmlClassList = DOCUMENT.documentElement.classList;

      var hclAdd = function hclAdd(suffix) {
        return htmlClassList.add("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var hclRemove = function hclRemove(suffix) {
        return htmlClassList.remove("".concat(HTML_CLASS_I2SVG_BASE_CLASS, "-").concat(suffix));
      };

      var prefixes = config.autoFetchSvg ? Object.keys(PREFIX_TO_STYLE) : Object.keys(styles$2);
      var prefixesDomQuery = [".".concat(LAYERS_TEXT_CLASSNAME, ":not([").concat(DATA_FA_I2SVG, "])")].concat(prefixes.map(function (p) {
        return ".".concat(p, ":not([").concat(DATA_FA_I2SVG, "])");
      })).join(', ');

      if (prefixesDomQuery.length === 0) {
        return Promise.resolve();
      }

      var candidates = [];

      try {
        candidates = toArray(root.querySelectorAll(prefixesDomQuery));
      } catch (e) {// noop
      }

      if (candidates.length > 0) {
        hclAdd('pending');
        hclRemove('complete');
      } else {
        return Promise.resolve();
      }

      var mark = perf.begin('onTree');
      var mutations = candidates.reduce(function (acc, node) {
        try {
          var mutation = generateMutation(node);

          if (mutation) {
            acc.push(mutation);
          }
        } catch (e) {
          if (!PRODUCTION) {
            if (e.name === 'MissingIcon') {
              console.error(e);
            }
          }
        }

        return acc;
      }, []);
      return new Promise(function (resolve, reject) {
        Promise.all(mutations).then(function (resolvedMutations) {
          perform(resolvedMutations, function () {
            hclAdd('active');
            hclAdd('complete');
            hclRemove('pending');
            if (typeof callback === 'function') callback();
            mark();
            resolve();
          });
        }).catch(function (e) {
          mark();
          reject(e);
        });
      });
    }

    function onNode(node) {
      var callback = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
      generateMutation(node).then(function (mutation) {
        if (mutation) {
          perform([mutation], callback);
        }
      });
    }

    function resolveIcons(next) {
      return function (maybeIconDefinition) {
        var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
        var iconDefinition = (maybeIconDefinition || {}).icon ? maybeIconDefinition : findIconDefinition(maybeIconDefinition || {});
        var mask = params.mask;

        if (mask) {
          mask = (mask || {}).icon ? mask : findIconDefinition(mask || {});
        }

        return next(iconDefinition, _objectSpread2(_objectSpread2({}, params), {}, {
          mask: mask
        }));
      };
    }

    var render = function render(iconDefinition) {
      var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var _params$transform = params.transform,
          transform = _params$transform === void 0 ? meaninglessTransform : _params$transform,
          _params$symbol = params.symbol,
          symbol = _params$symbol === void 0 ? false : _params$symbol,
          _params$mask = params.mask,
          mask = _params$mask === void 0 ? null : _params$mask,
          _params$maskId = params.maskId,
          maskId = _params$maskId === void 0 ? null : _params$maskId,
          _params$title = params.title,
          title = _params$title === void 0 ? null : _params$title,
          _params$titleId = params.titleId,
          titleId = _params$titleId === void 0 ? null : _params$titleId,
          _params$classes = params.classes,
          classes = _params$classes === void 0 ? [] : _params$classes,
          _params$attributes = params.attributes,
          attributes = _params$attributes === void 0 ? {} : _params$attributes,
          _params$styles = params.styles,
          styles = _params$styles === void 0 ? {} : _params$styles;
      if (!iconDefinition) return;
      var prefix = iconDefinition.prefix,
          iconName = iconDefinition.iconName,
          icon = iconDefinition.icon;
      return domVariants(_objectSpread2({
        type: 'icon'
      }, iconDefinition), function () {
        callHooks('beforeDOMElementCreation', {
          iconDefinition: iconDefinition,
          params: params
        });

        if (config.autoA11y) {
          if (title) {
            attributes['aria-labelledby'] = "".concat(config.replacementClass, "-title-").concat(titleId || nextUniqueId());
          } else {
            attributes['aria-hidden'] = 'true';
            attributes['focusable'] = 'false';
          }
        }

        return makeInlineSvgAbstract({
          icons: {
            main: asFoundIcon(icon),
            mask: mask ? asFoundIcon(mask.icon) : {
              found: false,
              width: null,
              height: null,
              icon: {}
            }
          },
          prefix: prefix,
          iconName: iconName,
          transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
          symbol: symbol,
          title: title,
          maskId: maskId,
          titleId: titleId,
          extra: {
            attributes: attributes,
            styles: styles,
            classes: classes
          }
        });
      });
    };
    var ReplaceElements = {
      mixout: function mixout() {
        return {
          icon: resolveIcons(render)
        };
      },
      hooks: function hooks() {
        return {
          mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
            accumulator.treeCallback = onTree;
            accumulator.nodeCallback = onNode;
            return accumulator;
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.i2svg = function (params) {
          var _params$node = params.node,
              node = _params$node === void 0 ? DOCUMENT : _params$node,
              _params$callback = params.callback,
              callback = _params$callback === void 0 ? function () {} : _params$callback;
          return onTree(node, callback);
        };

        providers$$1.generateSvgReplacementMutation = function (node, nodeMeta) {
          var iconName = nodeMeta.iconName,
              title = nodeMeta.title,
              titleId = nodeMeta.titleId,
              prefix = nodeMeta.prefix,
              transform = nodeMeta.transform,
              symbol = nodeMeta.symbol,
              mask = nodeMeta.mask,
              maskId = nodeMeta.maskId,
              extra = nodeMeta.extra;
          return new Promise(function (resolve, reject) {
            Promise.all([findIcon(iconName, prefix), mask.iconName ? findIcon(mask.iconName, mask.prefix) : Promise.resolve({
              found: false,
              width: 512,
              height: 512,
              icon: {}
            })]).then(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  main = _ref2[0],
                  mask = _ref2[1];

              resolve([node, makeInlineSvgAbstract({
                icons: {
                  main: main,
                  mask: mask
                },
                prefix: prefix,
                iconName: iconName,
                transform: transform,
                symbol: symbol,
                maskId: maskId,
                title: title,
                titleId: titleId,
                extra: extra,
                watchable: true
              })]);
            }).catch(reject);
          });
        };

        providers$$1.generateAbstractIcon = function (_ref3) {
          var children = _ref3.children,
              attributes = _ref3.attributes,
              main = _ref3.main,
              transform = _ref3.transform,
              styles = _ref3.styles;
          var styleString = joinStyles(styles);

          if (styleString.length > 0) {
            attributes['style'] = styleString;
          }

          var nextChild;

          if (transformIsMeaningful(transform)) {
            nextChild = callProvided('generateAbstractTransformGrouping', {
              main: main,
              transform: transform,
              containerWidth: main.width,
              iconWidth: main.width
            });
          }

          children.push(nextChild || main.icon);
          return {
            children: children,
            attributes: attributes
          };
        };
      }
    };

    var Layers = {
      mixout: function mixout() {
        return {
          layer: function layer(assembler) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes;
            return domVariants({
              type: 'layer'
            }, function () {
              callHooks('beforeDOMElementCreation', {
                assembler: assembler,
                params: params
              });
              var children = [];
              assembler(function (args) {
                Array.isArray(args) ? args.map(function (a) {
                  children = children.concat(a.abstract);
                }) : children = children.concat(args.abstract);
              });
              return [{
                tag: 'span',
                attributes: {
                  class: ["".concat(config.familyPrefix, "-layers")].concat(_toConsumableArray(classes)).join(' ')
                },
                children: children
              }];
            });
          }
        };
      }
    };

    var LayersCounter = {
      mixout: function mixout() {
        return {
          counter: function counter(content) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$title = params.title,
                title = _params$title === void 0 ? null : _params$title,
                _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes,
                _params$attributes = params.attributes,
                attributes = _params$attributes === void 0 ? {} : _params$attributes,
                _params$styles = params.styles,
                styles = _params$styles === void 0 ? {} : _params$styles;
            return domVariants({
              type: 'counter',
              content: content
            }, function () {
              callHooks('beforeDOMElementCreation', {
                content: content,
                params: params
              });
              return makeLayersCounterAbstract({
                content: content.toString(),
                title: title,
                extra: {
                  attributes: attributes,
                  styles: styles,
                  classes: ["".concat(config.familyPrefix, "-layers-counter")].concat(_toConsumableArray(classes))
                }
              });
            });
          }
        };
      }
    };

    var LayersText = {
      mixout: function mixout() {
        return {
          text: function text(content) {
            var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
            var _params$transform = params.transform,
                transform = _params$transform === void 0 ? meaninglessTransform : _params$transform,
                _params$title = params.title,
                title = _params$title === void 0 ? null : _params$title,
                _params$classes = params.classes,
                classes = _params$classes === void 0 ? [] : _params$classes,
                _params$attributes = params.attributes,
                attributes = _params$attributes === void 0 ? {} : _params$attributes,
                _params$styles = params.styles,
                styles = _params$styles === void 0 ? {} : _params$styles;
            return domVariants({
              type: 'text',
              content: content
            }, function () {
              callHooks('beforeDOMElementCreation', {
                content: content,
                params: params
              });
              return makeLayersTextAbstract({
                content: content,
                transform: _objectSpread2(_objectSpread2({}, meaninglessTransform), transform),
                title: title,
                extra: {
                  attributes: attributes,
                  styles: styles,
                  classes: ["".concat(config.familyPrefix, "-layers-text")].concat(_toConsumableArray(classes))
                }
              });
            });
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.generateLayersText = function (node, nodeMeta) {
          var title = nodeMeta.title,
              transform = nodeMeta.transform,
              extra = nodeMeta.extra;
          var width = null;
          var height = null;

          if (IS_IE) {
            var computedFontSize = parseInt(getComputedStyle(node).fontSize, 10);
            var boundingClientRect = node.getBoundingClientRect();
            width = boundingClientRect.width / computedFontSize;
            height = boundingClientRect.height / computedFontSize;
          }

          if (config.autoA11y && !title) {
            extra.attributes['aria-hidden'] = 'true';
          }

          return Promise.resolve([node, makeLayersTextAbstract({
            content: node.innerHTML,
            width: width,
            height: height,
            transform: transform,
            title: title,
            extra: extra,
            watchable: true
          })]);
        };
      }
    };

    var CLEAN_CONTENT_PATTERN = new RegExp("\"", 'ug');
    var SECONDARY_UNICODE_RANGE = [1105920, 1112319];
    function hexValueFromContent(content) {
      var cleaned = content.replace(CLEAN_CONTENT_PATTERN, '');
      var codePoint = codePointAt(cleaned, 0);
      var isPrependTen = codePoint >= SECONDARY_UNICODE_RANGE[0] && codePoint <= SECONDARY_UNICODE_RANGE[1];
      var isDoubled = cleaned.length === 2 ? cleaned[0] === cleaned[1] : false;
      return {
        value: isDoubled ? toHex(cleaned[0]) : toHex(cleaned),
        isSecondary: isPrependTen || isDoubled
      };
    }

    function replaceForPosition(node, position) {
      var pendingAttribute = "".concat(DATA_FA_PSEUDO_ELEMENT_PENDING).concat(position.replace(':', '-'));
      return new Promise(function (resolve, reject) {
        if (node.getAttribute(pendingAttribute) !== null) {
          // This node is already being processed
          return resolve();
        }

        var children = toArray(node.children);
        var alreadyProcessedPseudoElement = children.filter(function (c) {
          return c.getAttribute(DATA_FA_PSEUDO_ELEMENT) === position;
        })[0];
        var styles = WINDOW.getComputedStyle(node, position);
        var fontFamily = styles.getPropertyValue('font-family').match(FONT_FAMILY_PATTERN);
        var fontWeight = styles.getPropertyValue('font-weight');
        var content = styles.getPropertyValue('content');

        if (alreadyProcessedPseudoElement && !fontFamily) {
          // If we've already processed it but the current computed style does not result in a font-family,
          // that probably means that a class name that was previously present to make the icon has been
          // removed. So we now should delete the icon.
          node.removeChild(alreadyProcessedPseudoElement);
          return resolve();
        } else if (fontFamily && content !== 'none' && content !== '') {
          var _content = styles.getPropertyValue('content');

          var prefix = ~['Solid', 'Regular', 'Light', 'Thin', 'Duotone', 'Brands', 'Kit'].indexOf(fontFamily[2]) ? STYLE_TO_PREFIX[fontFamily[2].toLowerCase()] : FONT_WEIGHT_TO_PREFIX[fontWeight];

          var _hexValueFromContent = hexValueFromContent(_content),
              hexValue = _hexValueFromContent.value,
              isSecondary = _hexValueFromContent.isSecondary;

          var isV4 = fontFamily[0].startsWith('FontAwesome');
          var iconName = byUnicode(prefix, hexValue);
          var iconIdentifier = iconName;

          if (isV4) {
            var iconName4 = byOldUnicode(hexValue);

            if (iconName4.iconName && iconName4.prefix) {
              iconName = iconName4.iconName;
              prefix = iconName4.prefix;
            }
          } // Only convert the pseudo element in this ::before/::after position into an icon if we haven't
          // already done so with the same prefix and iconName


          if (iconName && !isSecondary && (!alreadyProcessedPseudoElement || alreadyProcessedPseudoElement.getAttribute(DATA_PREFIX) !== prefix || alreadyProcessedPseudoElement.getAttribute(DATA_ICON) !== iconIdentifier)) {
            node.setAttribute(pendingAttribute, iconIdentifier);

            if (alreadyProcessedPseudoElement) {
              // Delete the old one, since we're replacing it with a new one
              node.removeChild(alreadyProcessedPseudoElement);
            }

            var meta = blankMeta();
            var extra = meta.extra;
            extra.attributes[DATA_FA_PSEUDO_ELEMENT] = position;
            findIcon(iconName, prefix).then(function (main) {
              var abstract = makeInlineSvgAbstract(_objectSpread2(_objectSpread2({}, meta), {}, {
                icons: {
                  main: main,
                  mask: emptyCanonicalIcon()
                },
                prefix: prefix,
                iconName: iconIdentifier,
                extra: extra,
                watchable: true
              }));
              var element = DOCUMENT.createElement('svg');

              if (position === '::before') {
                node.insertBefore(element, node.firstChild);
              } else {
                node.appendChild(element);
              }

              element.outerHTML = abstract.map(function (a) {
                return toHtml(a);
              }).join('\n');
              node.removeAttribute(pendingAttribute);
              resolve();
            }).catch(reject);
          } else {
            resolve();
          }
        } else {
          resolve();
        }
      });
    }

    function replace(node) {
      return Promise.all([replaceForPosition(node, '::before'), replaceForPosition(node, '::after')]);
    }

    function processable(node) {
      return node.parentNode !== document.head && !~TAGNAMES_TO_SKIP_FOR_PSEUDOELEMENTS.indexOf(node.tagName.toUpperCase()) && !node.getAttribute(DATA_FA_PSEUDO_ELEMENT) && (!node.parentNode || node.parentNode.tagName !== 'svg');
    }

    function searchPseudoElements(root) {
      if (!IS_DOM) return;
      return new Promise(function (resolve, reject) {
        var operations = toArray(root.querySelectorAll('*')).filter(processable).map(replace);
        var end = perf.begin('searchPseudoElements');
        disableObservation();
        Promise.all(operations).then(function () {
          end();
          enableObservation();
          resolve();
        }).catch(function () {
          end();
          enableObservation();
          reject();
        });
      });
    }

    var PseudoElements = {
      hooks: function hooks() {
        return {
          mutationObserverCallbacks: function mutationObserverCallbacks(accumulator) {
            accumulator.pseudoElementsCallback = searchPseudoElements;
            return accumulator;
          }
        };
      },
      provides: function provides(providers$$1) {
        providers$$1.pseudoElements2svg = function (params) {
          var _params$node = params.node,
              node = _params$node === void 0 ? DOCUMENT : _params$node;

          if (config.searchPseudoElements) {
            searchPseudoElements(node);
          }
        };
      }
    };

    var _unwatched = false;
    var MutationObserver$1 = {
      mixout: function mixout() {
        return {
          dom: {
            unwatch: function unwatch() {
              disableObservation();
              _unwatched = true;
            }
          }
        };
      },
      hooks: function hooks() {
        return {
          bootstrap: function bootstrap() {
            observe(chainHooks('mutationObserverCallbacks', {}));
          },
          noAuto: function noAuto() {
            disconnect();
          },
          watch: function watch(params) {
            var observeMutationsRoot = params.observeMutationsRoot;

            if (_unwatched) {
              enableObservation();
            } else {
              observe(chainHooks('mutationObserverCallbacks', {
                observeMutationsRoot: observeMutationsRoot
              }));
            }
          }
        };
      }
    };

    var parseTransformString = function parseTransformString(transformString) {
      var transform = {
        size: 16,
        x: 0,
        y: 0,
        flipX: false,
        flipY: false,
        rotate: 0
      };
      return transformString.toLowerCase().split(' ').reduce(function (acc, n) {
        var parts = n.toLowerCase().split('-');
        var first = parts[0];
        var rest = parts.slice(1).join('-');

        if (first && rest === 'h') {
          acc.flipX = true;
          return acc;
        }

        if (first && rest === 'v') {
          acc.flipY = true;
          return acc;
        }

        rest = parseFloat(rest);

        if (isNaN(rest)) {
          return acc;
        }

        switch (first) {
          case 'grow':
            acc.size = acc.size + rest;
            break;

          case 'shrink':
            acc.size = acc.size - rest;
            break;

          case 'left':
            acc.x = acc.x - rest;
            break;

          case 'right':
            acc.x = acc.x + rest;
            break;

          case 'up':
            acc.y = acc.y - rest;
            break;

          case 'down':
            acc.y = acc.y + rest;
            break;

          case 'rotate':
            acc.rotate = acc.rotate + rest;
            break;
        }

        return acc;
      }, transform);
    };
    var PowerTransforms = {
      mixout: function mixout() {
        return {
          parse: {
            transform: function transform(transformString) {
              return parseTransformString(transformString);
            }
          }
        };
      },
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var transformString = node.getAttribute('data-fa-transform');

            if (transformString) {
              accumulator.transform = parseTransformString(transformString);
            }

            return accumulator;
          }
        };
      },
      provides: function provides(providers) {
        providers.generateAbstractTransformGrouping = function (_ref) {
          var main = _ref.main,
              transform = _ref.transform,
              containerWidth = _ref.containerWidth,
              iconWidth = _ref.iconWidth;
          var outer = {
            transform: "translate(".concat(containerWidth / 2, " 256)")
          };
          var innerTranslate = "translate(".concat(transform.x * 32, ", ").concat(transform.y * 32, ") ");
          var innerScale = "scale(".concat(transform.size / 16 * (transform.flipX ? -1 : 1), ", ").concat(transform.size / 16 * (transform.flipY ? -1 : 1), ") ");
          var innerRotate = "rotate(".concat(transform.rotate, " 0 0)");
          var inner = {
            transform: "".concat(innerTranslate, " ").concat(innerScale, " ").concat(innerRotate)
          };
          var path = {
            transform: "translate(".concat(iconWidth / 2 * -1, " -256)")
          };
          var operations = {
            outer: outer,
            inner: inner,
            path: path
          };
          return {
            tag: 'g',
            attributes: _objectSpread2({}, operations.outer),
            children: [{
              tag: 'g',
              attributes: _objectSpread2({}, operations.inner),
              children: [{
                tag: main.icon.tag,
                children: main.icon.children,
                attributes: _objectSpread2(_objectSpread2({}, main.icon.attributes), operations.path)
              }]
            }]
          };
        };
      }
    };

    var ALL_SPACE = {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%'
    };

    function fillBlack(abstract) {
      var force = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

      if (abstract.attributes && (abstract.attributes.fill || force)) {
        abstract.attributes.fill = 'black';
      }

      return abstract;
    }

    function deGroup(abstract) {
      if (abstract.tag === 'g') {
        return abstract.children;
      } else {
        return [abstract];
      }
    }

    var Masks = {
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var maskData = node.getAttribute('data-fa-mask');
            var mask = !maskData ? emptyCanonicalIcon() : getCanonicalIcon(maskData.split(' ').map(function (i) {
              return i.trim();
            }));

            if (!mask.prefix) {
              mask.prefix = getDefaultUsablePrefix();
            }

            accumulator.mask = mask;
            accumulator.maskId = node.getAttribute('data-fa-mask-id');
            return accumulator;
          }
        };
      },
      provides: function provides(providers) {
        providers.generateAbstractMask = function (_ref) {
          var children = _ref.children,
              attributes = _ref.attributes,
              main = _ref.main,
              mask = _ref.mask,
              explicitMaskId = _ref.maskId,
              transform = _ref.transform;
          var mainWidth = main.width,
              mainPath = main.icon;
          var maskWidth = mask.width,
              maskPath = mask.icon;
          var trans = transformForSvg({
            transform: transform,
            containerWidth: maskWidth,
            iconWidth: mainWidth
          });
          var maskRect = {
            tag: 'rect',
            attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
              fill: 'white'
            })
          };
          var maskInnerGroupChildrenMixin = mainPath.children ? {
            children: mainPath.children.map(fillBlack)
          } : {};
          var maskInnerGroup = {
            tag: 'g',
            attributes: _objectSpread2({}, trans.inner),
            children: [fillBlack(_objectSpread2({
              tag: mainPath.tag,
              attributes: _objectSpread2(_objectSpread2({}, mainPath.attributes), trans.path)
            }, maskInnerGroupChildrenMixin))]
          };
          var maskOuterGroup = {
            tag: 'g',
            attributes: _objectSpread2({}, trans.outer),
            children: [maskInnerGroup]
          };
          var maskId = "mask-".concat(explicitMaskId || nextUniqueId());
          var clipId = "clip-".concat(explicitMaskId || nextUniqueId());
          var maskTag = {
            tag: 'mask',
            attributes: _objectSpread2(_objectSpread2({}, ALL_SPACE), {}, {
              id: maskId,
              maskUnits: 'userSpaceOnUse',
              maskContentUnits: 'userSpaceOnUse'
            }),
            children: [maskRect, maskOuterGroup]
          };
          var defs = {
            tag: 'defs',
            children: [{
              tag: 'clipPath',
              attributes: {
                id: clipId
              },
              children: deGroup(maskPath)
            }, maskTag]
          };
          children.push(defs, {
            tag: 'rect',
            attributes: _objectSpread2({
              fill: 'currentColor',
              'clip-path': "url(#".concat(clipId, ")"),
              mask: "url(#".concat(maskId, ")")
            }, ALL_SPACE)
          });
          return {
            children: children,
            attributes: attributes
          };
        };
      }
    };

    var MissingIconIndicator = {
      provides: function provides(providers) {
        var reduceMotion = false;

        if (WINDOW.matchMedia) {
          reduceMotion = WINDOW.matchMedia('(prefers-reduced-motion: reduce)').matches;
        }

        providers.missingIconAbstract = function () {
          var gChildren = [];
          var FILL = {
            fill: 'currentColor'
          };
          var ANIMATION_BASE = {
            attributeType: 'XML',
            repeatCount: 'indefinite',
            dur: '2s'
          }; // Ring

          gChildren.push({
            tag: 'path',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              d: 'M156.5,447.7l-12.6,29.5c-18.7-9.5-35.9-21.2-51.5-34.9l22.7-22.7C127.6,430.5,141.5,440,156.5,447.7z M40.6,272H8.5 c1.4,21.2,5.4,41.7,11.7,61.1L50,321.2C45.1,305.5,41.8,289,40.6,272z M40.6,240c1.4-18.8,5.2-37,11.1-54.1l-29.5-12.6 C14.7,194.3,10,216.7,8.5,240H40.6z M64.3,156.5c7.8-14.9,17.2-28.8,28.1-41.5L69.7,92.3c-13.7,15.6-25.5,32.8-34.9,51.5 L64.3,156.5z M397,419.6c-13.9,12-29.4,22.3-46.1,30.4l11.9,29.8c20.7-9.9,39.8-22.6,56.9-37.6L397,419.6z M115,92.4 c13.9-12,29.4-22.3,46.1-30.4l-11.9-29.8c-20.7,9.9-39.8,22.6-56.8,37.6L115,92.4z M447.7,355.5c-7.8,14.9-17.2,28.8-28.1,41.5 l22.7,22.7c13.7-15.6,25.5-32.9,34.9-51.5L447.7,355.5z M471.4,272c-1.4,18.8-5.2,37-11.1,54.1l29.5,12.6 c7.5-21.1,12.2-43.5,13.6-66.8H471.4z M321.2,462c-15.7,5-32.2,8.2-49.2,9.4v32.1c21.2-1.4,41.7-5.4,61.1-11.7L321.2,462z M240,471.4c-18.8-1.4-37-5.2-54.1-11.1l-12.6,29.5c21.1,7.5,43.5,12.2,66.8,13.6V471.4z M462,190.8c5,15.7,8.2,32.2,9.4,49.2h32.1 c-1.4-21.2-5.4-41.7-11.7-61.1L462,190.8z M92.4,397c-12-13.9-22.3-29.4-30.4-46.1l-29.8,11.9c9.9,20.7,22.6,39.8,37.6,56.9 L92.4,397z M272,40.6c18.8,1.4,36.9,5.2,54.1,11.1l12.6-29.5C317.7,14.7,295.3,10,272,8.5V40.6z M190.8,50 c15.7-5,32.2-8.2,49.2-9.4V8.5c-21.2,1.4-41.7,5.4-61.1,11.7L190.8,50z M442.3,92.3L419.6,115c12,13.9,22.3,29.4,30.5,46.1 l29.8-11.9C470,128.5,457.3,109.4,442.3,92.3z M397,92.4l22.7-22.7c-15.6-13.7-32.8-25.5-51.5-34.9l-12.6,29.5 C370.4,72.1,384.4,81.5,397,92.4z'
            })
          });

          var OPACITY_ANIMATE = _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
            attributeName: 'opacity'
          });

          var dot = {
            tag: 'circle',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              cx: '256',
              cy: '364',
              r: '28'
            }),
            children: []
          };

          if (!reduceMotion) {
            dot.children.push({
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, ANIMATION_BASE), {}, {
                attributeName: 'r',
                values: '28;14;28;28;14;28;'
              })
            }, {
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                values: '1;0;1;1;0;1;'
              })
            });
          }

          gChildren.push(dot);
          gChildren.push({
            tag: 'path',
            attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
              opacity: '1',
              d: 'M263.7,312h-16c-6.6,0-12-5.4-12-12c0-71,77.4-63.9,77.4-107.8c0-20-17.8-40.2-57.4-40.2c-29.1,0-44.3,9.6-59.2,28.7 c-3.9,5-11.1,6-16.2,2.4l-13.1-9.2c-5.6-3.9-6.9-11.8-2.6-17.2c21.2-27.2,46.4-44.7,91.2-44.7c52.3,0,97.4,29.8,97.4,80.2 c0,67.6-77.4,63.5-77.4,107.8C275.7,306.6,270.3,312,263.7,312z'
            }),
            children: reduceMotion ? [] : [{
              tag: 'animate',
              attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                values: '1;0;0;0;0;1;'
              })
            }]
          });

          if (!reduceMotion) {
            // Exclamation
            gChildren.push({
              tag: 'path',
              attributes: _objectSpread2(_objectSpread2({}, FILL), {}, {
                opacity: '0',
                d: 'M232.5,134.5l7,168c0.3,6.4,5.6,11.5,12,11.5h9c6.4,0,11.7-5.1,12-11.5l7-168c0.3-6.8-5.2-12.5-12-12.5h-23 C237.7,122,232.2,127.7,232.5,134.5z'
              }),
              children: [{
                tag: 'animate',
                attributes: _objectSpread2(_objectSpread2({}, OPACITY_ANIMATE), {}, {
                  values: '0;0;1;1;0;0;'
                })
              }]
            });
          }

          return {
            tag: 'g',
            attributes: {
              'class': 'missing'
            },
            children: gChildren
          };
        };
      }
    };

    var SvgSymbols = {
      hooks: function hooks() {
        return {
          parseNodeAttributes: function parseNodeAttributes(accumulator, node) {
            var symbolData = node.getAttribute('data-fa-symbol');
            var symbol = symbolData === null ? false : symbolData === '' ? true : symbolData;
            accumulator['symbol'] = symbol;
            return accumulator;
          }
        };
      }
    };

    var plugins = [InjectCSS, ReplaceElements, Layers, LayersCounter, LayersText, PseudoElements, MutationObserver$1, PowerTransforms, Masks, MissingIconIndicator, SvgSymbols];

    registerPlugins(plugins, {
      mixoutsTo: api
    });
    api.noAuto;
    api.config;
    var library$1 = api.library;
    api.dom;
    api.parse;
    var findIconDefinition$1 = api.findIconDefinition;
    api.toHtml;
    var icon = api.icon;
    api.layer;
    api.text;
    api.counter;

    /* src/components/Icon.svelte generated by Svelte v3.47.0 */

    function create_fragment$2(ctx) {
    	let html_tag;

    	let raw_value = icon(
    		findIconDefinition$1({
    			prefix: /*prefix*/ ctx[0],
    			iconName: /*name*/ ctx[1]
    		}),
    		{ classes: /*classes*/ ctx[2] }
    	).html + "";

    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag();
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*prefix, name, classes*/ 7 && raw_value !== (raw_value = icon(
    				findIconDefinition$1({
    					prefix: /*prefix*/ ctx[0],
    					iconName: /*name*/ ctx[1]
    				}),
    				{ classes: /*classes*/ ctx[2] }
    			).html + "")) html_tag.p(raw_value);
    		},
    		i: noop$3,
    		o: noop$3,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Icon', slots, []);
    	let { prefix = 'fas', name = '', classes = '' } = $$props;
    	const writable_props = ['prefix', 'name', 'classes'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Icon> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('prefix' in $$props) $$invalidate(0, prefix = $$props.prefix);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    	};

    	$$self.$capture_state = () => ({
    		findIconDefinition: findIconDefinition$1,
    		icon,
    		prefix,
    		name,
    		classes
    	});

    	$$self.$inject_state = $$props => {
    		if ('prefix' in $$props) $$invalidate(0, prefix = $$props.prefix);
    		if ('name' in $$props) $$invalidate(1, name = $$props.name);
    		if ('classes' in $$props) $$invalidate(2, classes = $$props.classes);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [prefix, name, classes];
    }

    class Icon extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { prefix: 0, name: 1, classes: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Icon",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get prefix() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get name() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set name(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get classes() {
    		throw new Error("<Icon>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set classes(value) {
    		throw new Error("<Icon>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const queryCategories = gql `
{
  categories {
    id
    title
    cars {
      id
      title
      description
    } 
  }
}`;

    /* src/components/ResponseMessage.svelte generated by Svelte v3.47.0 */

    const { Object: Object_1 } = globals;
    const file$1 = "src/components/ResponseMessage.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (40:0) {#if messages.length}
    function create_if_block(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let button;
    	let icon;
    	let div1_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	let each_value = /*messages*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	icon = new Icon({ props: { name: "times" }, $$inline: true });

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			button = element("button");
    			create_component(icon.$$.fragment);
    			add_location(div0, file$1, 41, 8, 1023);
    			attr_dev(button, "class", "hover:opacity-80");
    			add_location(button, file$1, 46, 8, 1149);

    			attr_dev(div1, "class", div1_class_value = "h-min shadow rounded-md flex items-center space-x-2 justify-between px-4 py-2 text-base text-white " + ((/*response*/ ctx[1]?.ok)
    			? 'bg-green-500'
    			: 'bg-red-500'));

    			add_location(div1, file$1, 40, 4, 855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div0, null);
    			}

    			append_dev(div1, t);
    			append_dev(div1, button);
    			mount_component(icon, button, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*clearMessages*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1) {
    				each_value = /*messages*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div0, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (!current || dirty & /*response*/ 2 && div1_class_value !== (div1_class_value = "h-min shadow rounded-md flex items-center space-x-2 justify-between px-4 py-2 text-base text-white " + ((/*response*/ ctx[1]?.ok)
    			? 'bg-green-500'
    			: 'bg-red-500'))) {
    				attr_dev(div1, "class", div1_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			destroy_each(each_blocks, detaching);
    			destroy_component(icon);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(40:0) {#if messages.length}",
    		ctx
    	});

    	return block;
    }

    // (43:12) {#each messages as message}
    function create_each_block$1(ctx) {
    	let div;
    	let t_value = /*message*/ ctx[4] + "";
    	let t;

    	const block = {
    		c: function create() {
    			div = element("div");
    			t = text(t_value);
    			add_location(div, file$1, 43, 16, 1085);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*messages*/ 1 && t_value !== (t_value = /*message*/ ctx[4] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(43:12) {#each messages as message}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*messages*/ ctx[0].length && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*messages*/ ctx[0].length) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*messages*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ResponseMessage', slots, []);
    	let { response, messages = [] } = $$props;

    	onMount(async () => {
    		if (messages.length) {
    			if (!Array.isArray(messages)) {
    				$$invalidate(0, messages = [messages]);
    			}

    			return;
    		}

    		await initMessages();
    	});

    	async function initMessages() {
    		if (response?.ok) {
    			return $$invalidate(0, messages[0] = 'success', messages);
    		}

    		if (response?.status === 422) {
    			const data = await response.json();

    			if (data?.errors?.message) {
    				$$invalidate(0, messages = Object.values(data.errors.message).flat());
    			}
    		}

    		return $$invalidate(0, messages[0] = 'failed', messages);
    	}

    	function clearMessages() {
    		$$invalidate(0, messages = []);
    	}

    	const writable_props = ['response', 'messages'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ResponseMessage> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('response' in $$props) $$invalidate(1, response = $$props.response);
    		if ('messages' in $$props) $$invalidate(0, messages = $$props.messages);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		Icon,
    		response,
    		messages,
    		initMessages,
    		clearMessages
    	});

    	$$self.$inject_state = $$props => {
    		if ('response' in $$props) $$invalidate(1, response = $$props.response);
    		if ('messages' in $$props) $$invalidate(0, messages = $$props.messages);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [messages, response, clearMessages];
    }

    class ResponseMessage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { response: 1, messages: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ResponseMessage",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*response*/ ctx[1] === undefined && !('response' in props)) {
    			console.warn("<ResponseMessage> was created without expected prop 'response'");
    		}
    	}

    	get response() {
    		throw new Error("<ResponseMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set response(value) {
    		throw new Error("<ResponseMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get messages() {
    		throw new Error("<ResponseMessage>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set messages(value) {
    		throw new Error("<ResponseMessage>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function displayResponse(response, messages = []) {
        console.log(response, messages);
        const displayResponse = document.getElementById('display-response');
        displayResponse.innerHTML = '';
        new ResponseMessage({
            target: displayResponse,
            props: { response, messages }
        });
        console.log(response.ok);
        if (response === null || response === void 0 ? void 0 : response.ok)
            setTimeout(() => displayResponse.innerHTML = '', 5000);
    }

    /* src/App.svelte generated by Svelte v3.47.0 */

    const { console: console_1 } = globals;
    const file = "src/App.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[4] = list[i];
    	return child_ctx;
    }

    // (38:1) {#each categories ?? [] as category}
    function create_each_block(ctx) {
    	let p;
    	let t_value = /*category*/ ctx[4].title + "";
    	let t;

    	const block = {
    		c: function create() {
    			p = element("p");
    			t = text(t_value);
    			add_location(p, file, 38, 2, 1235);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, p, anchor);
    			append_dev(p, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*categories*/ 1 && t_value !== (t_value = /*category*/ ctx[4].title + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(p);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(38:1) {#each categories ?? [] as category}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let tailwindcss;
    	let t0;
    	let modeswitcher;
    	let t1;
    	let main;
    	let div0;
    	let h1;
    	let t3;
    	let icon;
    	let t4;
    	let t5;
    	let div2;
    	let div1;
    	let current;
    	tailwindcss = new Tailwindcss({ $$inline: true });
    	modeswitcher = new ModeSwitcher({ $$inline: true });

    	icon = new Icon({
    			props: {
    				name: "rocket",
    				classes: "text-5xl text-svelte"
    			},
    			$$inline: true
    		});

    	let each_value = /*categories*/ ctx[0] ?? [];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			create_component(tailwindcss.$$.fragment);
    			t0 = space();
    			create_component(modeswitcher.$$.fragment);
    			t1 = space();
    			main = element("main");
    			div0 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Base svelte app";
    			t3 = space();
    			create_component(icon.$$.fragment);
    			t4 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t5 = space();
    			div2 = element("div");
    			div1 = element("div");
    			attr_dev(h1, "class", "uppercase text-6xl leading-normal text-svelte");
    			add_location(h1, file, 33, 2, 1052);
    			attr_dev(div0, "class", "space-y-4");
    			add_location(div0, file, 32, 1, 1026);
    			attr_dev(div1, "class", "flex justify-end w-full");
    			attr_dev(div1, "id", "display-response");
    			add_location(div1, file, 41, 2, 1331);
    			attr_dev(div2, "class", "absolute bottom-4 right-4 z-50 w-max max-w-lg");
    			add_location(div2, file, 40, 1, 1269);
    			attr_dev(main, "class", "p-4 mx-auto text-center max-w-xl");
    			add_location(main, file, 31, 0, 977);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(tailwindcss, target, anchor);
    			insert_dev(target, t0, anchor);
    			mount_component(modeswitcher, target, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div0);
    			append_dev(div0, h1);
    			append_dev(div0, t3);
    			mount_component(icon, div0, null);
    			append_dev(main, t4);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(main, null);
    			}

    			append_dev(main, t5);
    			append_dev(main, div2);
    			append_dev(div2, div1);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*categories*/ 1) {
    				each_value = /*categories*/ ctx[0] ?? [];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(main, t5);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(tailwindcss.$$.fragment, local);
    			transition_in(modeswitcher.$$.fragment, local);
    			transition_in(icon.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(tailwindcss.$$.fragment, local);
    			transition_out(modeswitcher.$$.fragment, local);
    			transition_out(icon.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(tailwindcss, detaching);
    			if (detaching) detach_dev(t0);
    			destroy_component(modeswitcher, detaching);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(main);
    			destroy_component(icon);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	const client = new ApolloClient({
    			uri: 'http://localhost:1337/graphql',
    			cache: new InMemoryCache()
    		});

    	setClient(client);
    	let categories = [], loading = false;

    	onMount(() => {
    		displayResponse({ ok: false });
    	});

    	async function getCategories() {
    		const reply = await query(queryCategories);

    		reply.subscribe(data => {
    			var _a;
    			loading = data.loading;

    			$$invalidate(0, categories = (_a = data.data) === null || _a === void 0
    			? void 0
    			: _a.categories);
    		});
    	}

    	getCategories();
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		ModeSwitcher,
    		Tailwindcss,
    		ApolloClient,
    		InMemoryCache,
    		query,
    		setClient,
    		Icon,
    		queryCategories,
    		displayResponse,
    		onMount,
    		client,
    		categories,
    		loading,
    		getCategories
    	});

    	$$self.$inject_state = $$props => {
    		if ('categories' in $$props) $$invalidate(0, categories = $$props.categories);
    		if ('loading' in $$props) loading = $$props.loading;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*categories*/ 1) {
    			console.log(categories);
    		}
    	};

    	return [categories];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    /*!
     * Font Awesome Free 6.1.1 by @fontawesome - https://fontawesome.com
     * License - https://fontawesome.com/license/free (Icons: CC BY 4.0, Fonts: SIL OFL 1.1, Code: MIT License)
     * Copyright 2022 Fonticons, Inc.
     */
    var faRocket = {
      prefix: 'fas',
      iconName: 'rocket',
      icon: [512, 512, [], "f135", "M156.6 384.9L125.7 353.1C117.2 345.5 114.2 333.1 117.1 321.8C120.1 312.9 124.1 301.3 129.8 288H24C15.38 288 7.414 283.4 3.146 275.9C-1.123 268.4-1.042 259.2 3.357 251.8L55.83 163.3C68.79 141.4 92.33 127.1 117.8 127.1H200C202.4 124 204.8 120.3 207.2 116.7C289.1-4.07 411.1-8.142 483.9 5.275C495.6 7.414 504.6 16.43 506.7 28.06C520.1 100.9 516.1 222.9 395.3 304.8C391.8 307.2 387.1 309.6 384 311.1V394.2C384 419.7 370.6 443.2 348.7 456.2L260.2 508.6C252.8 513 243.6 513.1 236.1 508.9C228.6 504.6 224 496.6 224 488V380.8C209.9 385.6 197.6 389.7 188.3 392.7C177.1 396.3 164.9 393.2 156.6 384.9V384.9zM384 167.1C406.1 167.1 424 150.1 424 127.1C424 105.9 406.1 87.1 384 87.1C361.9 87.1 344 105.9 344 127.1C344 150.1 361.9 167.1 384 167.1z"]
    };
    var faXmark = {
      prefix: 'fas',
      iconName: 'xmark',
      icon: [320, 512, [128473, 10005, 10006, 10060, 215, "close", "multiply", "remove", "times"], "f00d", "M310.6 361.4c12.5 12.5 12.5 32.75 0 45.25C304.4 412.9 296.2 416 288 416s-16.38-3.125-22.62-9.375L160 301.3L54.63 406.6C48.38 412.9 40.19 416 32 416S15.63 412.9 9.375 406.6c-12.5-12.5-12.5-32.75 0-45.25l105.4-105.4L9.375 150.6c-12.5-12.5-12.5-32.75 0-45.25s32.75-12.5 45.25 0L160 210.8l105.4-105.4c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25l-105.4 105.4L310.6 361.4z"]
    };
    var faTimes = faXmark;

    library$1.add(faRocket, faTimes);
    const app = new App({
        target: document.body
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
