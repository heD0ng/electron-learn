<template>
    <div class="page-wrapper launch-page">
        <p>我是广告页</p>
    </div>
</template>

<script>
export default {
    name: "LaunchPage",
};
</script>

<style lang="scss" scoped>
.launch-page {
    background: $color-bg-theme;
    display: flex;
    justify-content: center;
    align-items: center;
    p {
        color: #fff;
        font-size: 40px;
    }
}
</style>
